import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      // stock: 'string',
      // top_ask_price: 'float',
      // top_bid_price: 'float',
      timestamp: 'date', //tracking all w.r.t time, need timestamp field
      ratio: 'float', //added to track ratio of two stocks
      upper_bound: 'float', //added to track upper bound
      lower_bound: 'float', //added to track lower bound
      // trigger_alert: 'boolean', //added to track when bounds are crossed
      trigger_alert: 'float', //added to track when bounds are crossed
      price_abc: 'float', //needed to calculate ratio
      price_def: 'float', //needed to calculate ratio
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line'); //type of graph to visualize data
      // elem.setAttribute('column-pivots', '["stock"]'); //removed bc we track ratios, not separate prices
      elem.setAttribute('row-pivots', '["timestamp"]'); //maps each datapoint based on timestamp
      elem.setAttribute('columns', '["ratio", "upper_bound", "lower_bound", "trigger_alert"]'); //focus on specific data parts to avoid noise
      elem.setAttribute('aggregates', JSON.stringify({
        timestamp: 'distinct count', //consolidate data points by timestamp
        ratio: 'avg', //avg values of non-unique fields
        upper_bound: 'avg', //avg values of non-unique fields
        lower_bound: 'avg', //avg values of non-unique fields
        trigger_alert: 'avg', //avg data points by timestamp
        price_abc: 'avg', //avg values of non-unique fields
        price_def: 'avg', //avg values of non-unique fields
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data), //update table with new data
      ] as unknown as TableData); //assertion to ensure the data is treated as TableData
    }
  }
}

export default Graph;