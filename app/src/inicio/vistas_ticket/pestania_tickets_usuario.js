import React, { Component } from 'react';
import Abrir_Ticket from "../abrir_ticket";
import Ticket_Vista_All from "../vistas_ticket/vista_ticket_all";

import Rodal from 'rodal';
import { Grid } from 'semantic-ui-react';
import { Progress, Icon, Form, message, Button } from 'antd';
import http from '../../services/http.services';

var moment = require('moment');

class PestaniaTicketsUsuario extends Component {
  constructor() {
    super();
    this.state = {
      tickets_abiertas: [],
      modal_abrirTicket: false,
      modal_verTicket: false,
      tickets_abiertas_resultado: [],
      ticket_abierta: undefined,
    }
  }

  componentDidMount() {
    this.getTicketsAbiertas()
  }

  render() {
    const { modalidad } = this.props;
    const { tickets_abiertas_resultado } = this.state;
    return (
      <div style={{ display: 'flex', overflowY: 'auto', flex: 1, height: '100%', width: '100%', paddingLeft: '20px', paddingRight: '20px' }}>
        {this.modalAbrirTicket()}
        {this.modalVerTicket()}
        <Grid container columns={3} padded stackable>
          {(modalidad === 'tickets_abiertas') &&
            <Grid.Column>
              <Button
                type="dashed"
                onClick={() => { this.solicito_abrirTicket() }}
                style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%', height: '100px', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon type="plus-circle" style={{ fontSize: 35, marginTop: 5 }} />
                <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap', fontSize: 15, marginTop: 5 }}>
                  Nuevo Ticket
              </div>
              </Button>
            </Grid.Column>
          }
          {tickets_abiertas_resultado.map((ticket, i) => (
            <Grid.Column key={i}>
              <ItemTicket ticket={ticket} visualizarTicketAbierta={this.visualizarTicketAbierta.bind(this)} modalidad={modalidad} />
            </Grid.Column>
          ))}
        </Grid>
      </div>
    )
  }

  solicito_abrirTicket() {
    this.setState({ modal_abrirTicket: true });
  }

  visualizarTicketAbierta(ticket) {
    this.setState({ ticket_abierta: ticket }, () => {
      this.setState({ modal_verTicket: true });
    });
  }

  modalAbrirTicket() {
    const { modal_abrirTicket, tickets_usuario } = this.state;
    const { Server, id_usuario } = this.props;
    return (
      <Rodal
        animation={'fade'}
        visible={modal_abrirTicket}
        onClose={() => { this.setState({ modal_abrirTicket: !modal_abrirTicket }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10, height: '90%', width: '90%' }}
      >
        {(modal_abrirTicket) &&
          <div>
            {(tickets_usuario != []) &&
              <Abrir_Ticket Server={Server} tickets_usuario={tickets_usuario} id_usuario={id_usuario} cerrarModalTickets={this.cerrarModalTickets.bind(this)} />
            }
          </div>
        }
      </Rodal>
    )
  }

  modalVerTicket() {
    const { modal_verTicket, ticket_abierta } = this.state;
    const { Server, modalidad, id_usuario } = this.props;
    return (
      <Rodal
        animation={'fade'}
        visible={modal_verTicket}
        onClose={() => { this.setState({ modal_verTicket: false }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10, height: '67%', width: '50%' }}
      >
        {(this.state.modal_verTicket) &&
          <div style={{ width: '100%', height: '100%' }}>
            <Ticket_Vista_All
              getTicketsAbiertas={this.getTicketsAbiertas.bind(this)}
              Server={Server}
              modalidad={(modalidad == 'tickets_abiertas_soporte' || modalidad == 'tickets_cerradas_soporte') ? 'soporte' : 'usuario'}
              id_usuario_ticket={ticket_abierta.id_usuario_ticket} id_usuario={id_usuario} cerrarModalVerTicket={this.cerrarModalVerTicket.bind(this)} />
          </div>
        }
      </Rodal>
    )
  }

  cerrarModalVerTicket() {
    this.setState({ modal_verTicket: false });
  }

  cerrarModalTickets() {
    this.setState({ modal_abrirTicket: false });
    this.getTicketsAbiertas();
  }

  getTicketsAbiertas() {
    const { Server, modalidad, fecha, id_usuario } = this.props;
    let server = String(Server);
    let accion = '';
    if (modalidad == 'tickets_abiertas') {
      accion = 'get_tickets_abiertas_usuario';
    } else if (modalidad == 'tickets_cerradas') {
      accion = 'get_tickets_cerradas_usuario';
    } else if (modalidad == 'tickets_abiertas_soporte') {
      accion = 'get_tickets_abiertas_soporte';
    } else if (modalidad == 'tickets_cerradas_soporte') {
      accion = 'get_tickets_cerradas_soporte';
    }

    this.setState({ cargando: true });
    var data = new FormData();
    data.append('id_usuario', id_usuario);

    if (fecha) {
      data.append('fecha', moment(fecha).format('YYYY-MM-DD'));
    }

    http._POST(server + 'configuracion/usuario.php?accion=' + accion, data).then((res) => {
      if (res !== 'error') {
        this.setState({ tickets_abiertas: res, tickets_abiertas_resultado: res });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Tickets.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Tickets." + err);
      this.setState({ cargando: false });
    });
  }
}

const TicketsUsuario = Form.create()(PestaniaTicketsUsuario);
class ItemTicket extends Component {
  render() {
    const { visualizarTicketAbierta, ticket, modalidad } = this.props;
    return (
      <Button
        onClick={() => { visualizarTicketAbierta(ticket) }}
        style={{
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: 'white',
          boxShadow: '0px 1px 4px #909497',
          borderRadius: 10,
          border: 'none',
          borderColor: 'black',
          outline: 'none',
          padding: '5px',
          height: '100px',
          width: '100%',
        }}>

        {(parseInt(ticket.estado) == 0) &&
          <div style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>
            Fase: {ticket.fase_ticket}
          </div>
        }

        {(parseInt(ticket.estado) == 1 && !ticket.id_calificacion && modalidad == 'tickets_abiertas') &&
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', fontSize: 10, whiteSpace: 'pre-wrap' }}>
            <div style={{ backgroundColor: '#F4D03F', color: 'black', width: '55%', borderRadius: 4, padding: '1px' }}>
              ¡Pendiente de Calificar!
              </div>
          </div>
        }

        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: '30%', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Icon type="tool" style={{ color: '#5DADE2', fontSize: 40, textAlign: 'center', padding: 5 }} />
          </div>
          <div style={{ width: '70%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap' }}>
              <h4>{ticket.nombre_ticket}</h4>
            </div>
            <div style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>
              {ticket.descripcion}
            </div>
            {(parseInt(ticket.estado) == 1) &&
              <div style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>
                Por {ticket.nombre_completo}
              </div>
            }
          </div>

          {(parseInt(ticket.estado) == 0 || (!ticket.id_calificacion && modalidad == 'tickets_abiertas')) &&
            <div style={{ padding: 5 }}>
              {(parseInt(ticket.estado) == 0) &&
                <Progress strokeLinecap="square" type="circle" percent={parseInt((parseInt(ticket.total_fases_ticket) * 100) / parseInt(ticket.total_fases))} width={50} />
              }
              {(parseInt(ticket.estado) == 1) &&
                <Progress strokeLinecap="square" type="circle" percent={100} width={50} />
              }
            </div>
          }
        </div>
      </Button>
    )
  }
}
export default TicketsUsuario;