package circuits

import (
	"math/big"

	"github.com/brevis-network/brevis-sdk/sdk"
	"github.com/celer-network/goutils/log"
	"github.com/consensys/gnark/frontend"
	"github.com/ethereum/go-ethereum/common"
)

type AppCircuit struct{}

var ScaleFactor sdk.Uint248

var _ sdk.AppCircuit = &AppCircuit{}

var SettlementContract = sdk.ConstUint248(
	common.HexToAddress("0x9008D19f58AAbD9eD0D60971565AA8510560ab41"))

func (c *AppCircuit) Allocate() (maxReceipts, maxStorage, maxTransactions int) {
	return 32, 0, 0
}

func (c *AppCircuit) Define(api *sdk.CircuitAPI, in sdk.DataInput) error {
	scaleFactor := new(big.Int)
	scaleFactor.SetString("1000000000000000000", 10)
	ScaleFactor = sdk.ConstUint248(scaleFactor)

	receipts := sdk.NewDataStream(api, in.Receipts)
	var u248 = api.Uint248

	sdk.AssertEach(receipts, func(r sdk.Receipt) sdk.Uint248 {
		return u248.IsEqual(r.Fields[0].Contract, SettlementContract)
	})

	dp := sdk.DataPoints[sdk.Receipt]{
		Raw:     make([]sdk.Receipt, 2),
		Toggles: make([]frontend.Variable, 2),
	}
	for i := range dp.Raw {
		dp.Raw[i] = in.Receipts.Raw[i]
		dp.Toggles[i] = 1
	}
	twoReceipts := sdk.NewDataStream(api, dp)
	prices := sdk.Map(twoReceipts, func(r sdk.Receipt) sdk.Uint248 {
		log.Infoln(r.BlockNum)
		sellAmount := api.ToUint248(r.Fields[0].Value)
		log.Infoln(sellAmount)
		buyAmount := api.ToUint248(r.Fields[1].Value)
		log.Infoln(buyAmount)
		buyAmount = u248.Mul(buyAmount, ScaleFactor)
		quotient, _ := u248.Div(buyAmount, sellAmount)
		log.Infoln("quotient", quotient)
		return quotient
	})
	// count := sdk.Count(receipts)
	// raw := in.Receipts.Raw
	// var lastReceipt sdk.Receipt
	// var latestPrice sdk.Uint248
	// for i := 0; i < len(raw); i++ {
	// 	receipt := raw[i]
	// 	isValid := api.Uint248.Not(api.Uint248.IsEqual(api.ToUint248(receipt.BlockNum), sdk.ConstUint248(0)))
	// 	divisor := api.Uint248.Select(isValid, api.ToUint248(receipt.Fields[0].Value), sdk.ConstUint248(1))
	// 	price, _ := api.Uint248.Div(api.ToUint248(receipt.Fields[1].Value), divisor)
	// 	latestPrice = api.ToUint248(api.Uint248.Select(
	// 		isValid,
	// 		latestPrice,
	// 		price,
	// ))
	// }
	// for i := len(raw) - 1; i >= 0; i-- {
	// 	if raw[i].BlockNum != sdk.ConstUint32(0) {
	// 		lastReceipt = raw[i]
	// 		break
	// 	}
	// }
	lastReceipt := sdk.GetUnderlying(twoReceipts, 1)
	// api.Uint248.AssertIsEqual(
	// 	api.Uint248.IsGreaterThan(count, sdk.ConstUint248(0)),
	// 	sdk.ConstUint248(10),
	// )
	log.Infoln("latest price buy", lastReceipt.Fields[1].Value)
	log.Infoln("latest price sell", lastReceipt.Fields[0].Value)

	latestPrice, _ := u248.Div((u248.Mul(api.ToUint248(lastReceipt.Fields[1].Value), ScaleFactor)), api.ToUint248(lastReceipt.Fields[0].Value))
	log.Infoln("latest price", latestPrice)

	meanPrice := sdk.Mean(prices)
	log.Infoln("mean price", meanPrice)

	squaredDiffs := sdk.Map(prices, func(p sdk.Uint248) sdk.Uint248 {
		diff := u248.Sub(p, meanPrice)
		return u248.Mul(diff, diff)
	})
	log.Infoln("squared diffs", squaredDiffs)
	variance := sdk.Mean(squaredDiffs)
	log.Infoln("variance", variance)
	stdDev := u248.Sqrt(variance)
	log.Infoln("std dev", stdDev)
	currentDiff := u248.Sub(latestPrice, meanPrice)
	log.Infoln("current diff", currentDiff)
	zScore, _ := u248.Div(u248.Mul(currentDiff, ScaleFactor), stdDev)
	log.Infoln("z score", zScore)

	minPrice := sdk.Min(prices)
	maxPrice := sdk.Max(prices)

	api.OutputUint(248, latestPrice)
	api.OutputUint(248, meanPrice)
	api.OutputUint(248, zScore)
	api.OutputUint(248, minPrice)
	api.OutputUint(248, maxPrice)

	return nil
}
