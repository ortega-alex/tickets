import React, { Component } from 'react';

import { Cascader } from 'antd';

const options = [{
  value: 'zhejiang',
  label: 'Zhejiang',
  children: [{
    value: 'hangzhou',
    label: 'Hangzhou',
    children: [{
      value: 'xihu',
      label: 'West Lake',
    }],
  }],
}, {
  value: 'jiangsu',
  label: 'Jiangsu',
  children: [{
    value: 'nanjing',
    label: 'Nanjing',
    children: [{
      value: 'zhonghuamen',
      label: 'Zhong Hua Men',
    }],
  }],
}];


class inicio extends Component {

  onChange(value) {
    console.log(value);
  }

  componentWillMount() {
    //alert("hola")
  }

  componentDidMount() {
    //alert("hola")
  }

  componentWillUnmount() {

  }

  constructor() {
    super();
    this.state = {
      showMenu: false,
    }
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        hola
      <Cascader defaultValue={['zhejiang', 'hangzhou', 'xihu']} options={options} onChange={this.onChange} />
      </div>
    );
  }
}

export default inicio;