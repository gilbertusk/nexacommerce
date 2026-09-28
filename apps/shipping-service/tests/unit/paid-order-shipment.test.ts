import { parsePaidOrderShipments } from '../../src/messaging/paid-order-shipment';

describe('paid order shipment snapshot', () => {
  const shipment = {
    sellerId: 'seller-1',
    originCity: 'Bandung',
    originProvince: 'Jawa Barat',
    courierCode: 'JNE',
    serviceCode: 'reg',
    weightGrams: 1250,
    cost: 18000,
  };

  it('uses the paid quote snapshot without inventing an origin or price', () => {
    expect(parsePaidOrderShipments({ shipmentBreakdown: [shipment] })).toEqual([{
      ...shipment, courierCode: 'jne', serviceCode: 'REG',
    }]);
  });

  it('rejects an order without a trusted shipment snapshot', () => {
    expect(() => parsePaidOrderShipments({ shipmentBreakdown: null }))
      .toThrow('no trusted shipment quote snapshot');
  });

  it('returns one immutable shipment per seller', () => {
    const result = parsePaidOrderShipments({
      shipmentBreakdown: [shipment, { ...shipment, sellerId: 'seller-2', originCity: 'Jakarta' }],
    });
    expect(result).toHaveLength(2);
    expect(result.map((entry) => entry.sellerId)).toEqual(['seller-1', 'seller-2']);
  });

  it('rejects duplicate seller snapshots', () => {
    expect(() => parsePaidOrderShipments({ shipmentBreakdown: [shipment, shipment] }))
      .toThrow('duplicate shipment snapshot');
  });
});
