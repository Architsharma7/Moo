package circuits

import (
	"github.com/brevis-network/brevis-sdk/sdk"
)

type AppCircuit struct{}

var _ sdk.AppCircuit = &AppCircuit{}

func (c *AppCircuit) Allocate() (maxReceipts, maxStorage, maxTransactions int) {
	return 32, 0, 0
}

func (c *AppCircuit) Define(api *sdk.CircuitAPI, input sdk.DataInput) error {
	receipts := sdk.NewDataStream(api, input.Receipts)

	prices := sdk.Map(receipts, func(r sdk.Receipt) sdk.Uint248 {
		sellAmount := api.ToUint248(r.Fields[0].Value)
		buyAmount := api.ToUint248(r.Fields[1].Value)
		return api.Uint248.Div(buyAmount, sellAmount)
	})

	latestPrice := prices[prices.Length()-1]
	meanPrice := sdk.Mean(prices)

	squaredDiffs := sdk.Map(prices, func(p sdk.Uint248) sdk.Uint248 {
		diff := api.Uint248.Sub(p, meanPrice)
		return api.Uint248.Mul(diff, diff)
	})
	variance := sdk.Mean(squaredDiffs)
	stdDev := api.Uint248.Sqrt(variance)

	currentDiff := api.Uint248.Sub(latestPrice, meanPrice)
	zScore := api.Uint248.Div(currentDiff, stdDev)

	minPrice := sdk.Min(prices)
	maxPrice := sdk.Max(prices)

	api.OutputUint(248, latestPrice)
	api.OutputUint(248, meanPrice)
	api.OutputUint(248, zScore)
	api.OutputUint(248, minPrice)
	api.OutputUint(248, maxPrice)

	return nil
}
