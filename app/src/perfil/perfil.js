import React, { Component } from 'react';

import { Grid } from 'semantic-ui-react'

//recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

class perfil extends Component {
  constructor() {
    super();
    this.state = {
      showMenu: false,
    }
  }

  render() {
    const data = [
      { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
      { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
      { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
      { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
      { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
      { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
      { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
    ];

    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%', height: '100%' }}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%' }}>
          <Grid container columns={3} padded stackable style={{ height: '100%' }}>
            <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ alignItems: 'center', textAlign: 'center', backgroundColor: 'white', boxShadow: '0px 1px 4px #909497', borderRadius: 10, border: 'none', borderColor: 'black', outline: 'none', padding: '5px', height: '80%', width: '80%' }}>
                Tickets despachadas hasta ahora
             </div>
            </Grid.Column>
            <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ alignItems: 'center', textAlign: 'center', backgroundColor: 'white', boxShadow: '0px 1px 4px #909497', borderRadius: 10, border: 'none', borderColor: 'black', outline: 'none', padding: '5px', height: '80%', width: '80%' }}>
                Nivel promedio de satisfacción
              </div>
            </Grid.Column>
            <Grid.Column style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ alignItems: 'center', textAlign: 'center', backgroundColor: 'white', boxShadow: '0px 1px 4px #909497', borderRadius: 10, border: 'none', borderColor: 'black', outline: 'none', padding: '5px', height: '80%', width: '80%' }}>
                Otros datos pendiente
               </div>
            </Grid.Column>
          </Grid>
        </div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%' }}>
          <BarChart width={600} height={300} data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pv" fill="#8884d8" />
            <Bar dataKey="uv" fill="#82ca9d" />
          </BarChart>
        </div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%' }}>
        </div>
      </div>
    );
  }
}

export default perfil;