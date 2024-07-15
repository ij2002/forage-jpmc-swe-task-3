// responsible for processing the raw stock data we receive from the server before the Graph component renders it
import { ServerRespond } from './DataStreamer';

export interface Row {
  // stock: string,
  // top_ask_price: number,
  // top_bid_price: number, 
  timestamp: Date,
  ratio: number, 
  upper_bound: number, 
  lower_bound: number, 
  trigger_alert: number | undefined, 
  price_abc: number, 
  price_def: number, 
}

export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row {
    const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2;
    const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;
    const upperBound = 1 + 0.04; // 4% above the average ratio
    const lowerBound = 1 - 0.04; // 4% below the average ratio

    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ? 
                 serverResponds[0].timestamp : serverResponds[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };
  }
}