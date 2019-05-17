import React, { Component } from 'react';

import InfiniteCalendar from 'react-infinite-calendar';
import PestaniaTicketsUsuario from "../inicio/vistas_ticket/pestania_tickets_usuario";

const id_usuario = '3';
class inicio extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fecha: undefined,
    }
  }

  componentDidMount() {
    this.setState({ fecha: new Date() })
  }

  render() {
    var today = new Date();
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    const { fecha } = this.state;
    const { Server } = this.props;
    return (
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', overflowY: 'hidden' }}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '70%', height: '100%' }}>
          {fecha &&
            <PestaniaTicketsUsuario fecha={fecha} Server={Server} id_usuario={id_usuario} modalidad='tickets_abiertas_soporte' rol={this.props.rol} />
          }
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <InfiniteCalendar
            onSelect={(date) => { this.setState({ fecha: undefined }, () => { this.setState({ fecha: date }) }) }}
            width={300}
            height={600}
            selected={fecha}
            disabledDays={[0, 6]}
            //minDate={lastWeek}
            maxDate={lastWeek}
            locale={{
              locale: require('date-fns/locale/es'),
              headerFormat: 'dddd, D MMM',
              weekdays: ["Dom", "Lun", "Mar", "Mier", "Jue", "Vien", "Sab"],
              todayLabel: {
                long: 'Hoy',
                short: 'Hoy'
              }
            }}
          />
        </div>
      </div>
    );
  }
}

export default inicio;