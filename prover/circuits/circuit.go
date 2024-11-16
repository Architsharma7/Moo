package circuits

import (
	"github.com/brevis-network/brevis-sdk/sdk"
	"github.com/celer-network/goutils/log"
	"github.com/ethereum/go-ethereum/common"
)

type AppCircuit struct{}

var _ sdk.AppCircuit = &AppCircuit{}

var SettlementContract = sdk.ConstUint248(
	common.HexToAddress("0x9008D19f58AAbD9eD0D60971565AA8510560ab41"))

func (c *AppCircuit) Allocate() (maxReceipts, maxStorage, maxTransactions int) {
	return 32, 0, 0
}

func (c *AppCircuit) Define(api *sdk.CircuitAPI, in sdk.DataInput) error {
	receipts := sdk.NewDataStream(api, in.Receipts)
	var u248 = api.Uint248

	sdk.AssertEach(receipts, func(r sdk.Receipt) sdk.Uint248 {
		return u248.IsEqual(r.Fields[0].Contract, SettlementContract)
	})

	prices := sdk.Map(receipts, func(r sdk.Receipt) sdk.Uint248 {
		log.Infoln(r.BlockNum)
		sellAmount := api.ToUint248(r.Fields[0].Value)
		log.Infoln(sellAmount)
		buyAmount := api.ToUint248(r.Fields[1].Value)
		log.Infoln(buyAmount)
		quotient, _ := u248.Div(buyAmount, sellAmount)
		return quotient
	})

	count := sdk.Count(receipts)
	raw := in.Receipts.Raw
	var lastReceipt sdk.Receipt
	for i := len(raw) - 1; i >= 0; i-- {
		if raw[i].BlockNum != sdk.ConstUint32(0) {
			lastReceipt = raw[i]
			break
		}
	}
	api.Uint248.AssertIsEqual(
		api.Uint248.IsGreaterThan(count, sdk.ConstUint248(0)),
		sdk.ConstUint248(10),
	)

	latestPrice, _ := u248.Div(api.ToUint248(lastReceipt.Fields[1].Value), api.ToUint248(lastReceipt.Fields[0].Value))

	meanPrice := sdk.Mean(prices)

	squaredDiffs := sdk.Map(prices, func(p sdk.Uint248) sdk.Uint248 {
		diff := u248.Sub(p, meanPrice)
		return u248.Mul(diff, diff)
	})
	variance := sdk.Mean(squaredDiffs)
	stdDev := u248.Sqrt(variance)
	currentDiff := u248.Sub(latestPrice, meanPrice)
	zScore, _ := u248.Div(currentDiff, stdDev)

	minPrice := sdk.Min(prices)
	maxPrice := sdk.Max(prices)

	api.OutputUint(248, latestPrice)
	api.OutputUint(248, meanPrice)
	api.OutputUint(248, zScore)
	api.OutputUint(248, minPrice)
	api.OutputUint(248, maxPrice)

	return nil
}
