import React, { Component } from 'react';
//import Abrir_Ticket from "../abrir_ticket";
import NuevoTicket from '../nuevo-ticket.component';
import Ticket_Vista_All from "../vistas_ticket/vista_ticket_all";

import Rodal from 'rodal';
import { Grid } from 'semantic-ui-react';
import { Progress, DatePicker , Icon, Form, message, Button , Input} from 'antd';
import http from '../../services/http.services';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';

var moment = require('moment');
require("moment/min/locales.min");
moment.locale('es');
const Search = Input.Search;
const {  MonthPicker } = DatePicker;

class PestaniaTicketsUsuario extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tickets_abiertas: [],
      modal_abrirTicket: false,
      modal_verTicket: false,
      tickets_abiertas_resultado: [],
      ticket_abierta: undefined,
      texto_busqueda : '',
      date: moment() 
    }    
  }

  componentDidMount() {
    this.getTicketsAbiertas();
  }

  render() {
    const { modalidad } = this.props;
    const { tickets_abiertas_resultado } = this.state;
    return (
      <div  style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%' }}>
        {this.modalAbrirTicket()}
        {this.modalVerTicket()}
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center',  marginBottom: 30 }}>
          {(this.state.texto_busqueda !== undefined) &&
            <div >
              <Search
                style={{ width: 300, height: 33, marginLeft: 100, }}
                defaultValue={this.state.texto_busqueda}
                placeholder="Buscar Ticket"
                onSearch={value => this.bucarTicket(value)}
                enterButton
              />
            </div>
          }
          {(this.props.modalidad == 'tickets_cerradas' || this.props.modalidad == 'tickets_cerradas_soporte') && 
            <div style={{ marginLeft: '10px' }}>
              <MonthPicker
                id="datepicker"
                style={{ width: '150px' }}
                format="YYYY-MM"
                value={ this.state.date }
                onChange={(value) => {
                  this.handleChangeDate(value);
                }}
              />
            </div> 
          }           
        </div>
        <div style={{height:'750px' , overflowY:'auto'}}>
        <Grid container columns={3} padded stackable >
          {(modalidad == 'tickets_abiertas') &&
            <Grid.Column>
              <Button
                type="dashed"
                onClick={() => { this.solicito_abrirTicket() }}
                style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%', height: '125px', alignItems: 'center', justifyContent: 'center' ,border: 'solid' ,  borderStyle: 'dashed' , paddingTop: '5%'}}
              >
                <Icon type="plus-circle" style={{ fontSize: 35, marginTop: 5 }} />
                <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap', fontSize: 15, marginTop: 5 }}>
                  <b>Nuevo Ticket</b>
              </div>
              </Button>
            </Grid.Column>
          }
          { (modalidad == 'tickets_abiertas' || modalidad == 'tickets_abiertas_soporte' ) ?
            tickets_abiertas_resultado.map((ticket, i) => (
              <Grid.Column key={i} >
                <ItemTicket ticket={ticket} visualizarTicketAbierta={this.visualizarTicketAbierta.bind(this)} modalidad={modalidad} />
              </Grid.Column>
            ))
          : 
          <div
            className="ag-theme-balham"
            style={{
                height: '410px',
                width: '100%',
            }}
          >
            <AgGridReact
              floatingFilter={true}
              enableSorting={true}
              animateRows={true}
              enableColResize={true}
              rowSelection='single'
              onGridReady={(params) => { params.api.sizeColumnsToFit(); }}
              rowData={tickets_abiertas_resultado}>
              <AgGridColumn headerName="Ticket" field="correlativo" />
              <AgGridColumn headerName="Nombre" field={"nombre_ticket"} />
              <AgGridColumn headerName="Tecnico" field="nombre_completo" />              
              <AgGridColumn headerName="Departamento" field={"departamento"} />
              <AgGridColumn headerName="Fecha Cierre" field={"fecha_fin"} />  
              <AgGridColumn suppressFilter headerName=" " field={"data"}
                  cellRendererFramework={(param) => {
                      return (
                          <Button onClick={() => { this.visualizarTicketAbierta(param.data) }} type="primary" htmlType="button" style={{ marginLeft: 10, height: '70%', width: '55%', justifyContent: 'center', alignItems: 'center', fontSize: 10 }}>
                              Ver&nbsp;<Icon type="eye" style={{ color: 'white', fontSize: 10, }} />
                          </Button>
                      )
                  }}
              />          
            </AgGridReact>
          </div>         
          }
        </Grid>
        </div>
      </div>
    )
  }

  handleChangeDate(value) {
    this.setState({ date : value});
    this.getTicketsAbiertas(value);
  }

  bucarTicket(valor) {
    if (valor !== "") {
      let array = this.state.tickets_abiertas;
      array = array.filter((elemento) => {
        let nombre = elemento.nombre_ticket.toLowerCase();
        let correlativo = elemento.correlativo;
        let usuario = elemento.nombre_completo.toLowerCase();
        return nombre.indexOf(valor.toLowerCase()) != -1 || 
               correlativo.indexOf(valor) != -1 ||
               usuario.indexOf(valor.toLowerCase()) != -1; 
      });
      this.setState({ tickets_abiertas_resultado: array });
    } else {
      this.setState({ tickets_abiertas_resultado: this.state.tickets_abiertas })
    }
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
        customStyles={{ borderRadius: 10, height: '80%', width: '70%' }}
      >
        {(modal_abrirTicket) &&
          <div style={{ height: '100%', width: '100%' }}>
            {(tickets_usuario != []) &&
              <NuevoTicket  Server={Server} id_usuario={id_usuario} cerrarModalTickets={this.cerrarModalTickets.bind(this)} />
              /*<Abrir_Ticket Server={Server} tickets_usuario={tickets_usuario} id_usuario={id_usuario} cerrarModalTickets={this.cerrarModalTickets.bind(this)} />*/
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
        customStyles={{ borderRadius: 10, height: '70%', width: '70%' }}
      >
        {(this.state.modal_verTicket) &&
          <div style={{ width: '100%', height: '100%' }}>
            <Ticket_Vista_All
              accesos={this.props.accesos}
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

  getTicketsAbiertas(value = null) {
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
    var mes = (value != null) ? value : this.state.date;
    data.append('mes' , mes.format('YYYY-MM-DD')); 
    data.append('rol' , this.props.rol);   

    if (fecha) {
      data.append('fecha', moment(fecha).format('YYYY-MM-DD'));
    }

    http._POST(server + 'configuracion/usuario.php?accion=' + accion, data).then((res) => {
      if (res !== 'error') {       
        this.setState({ tickets_abiertas: res, tickets_abiertas_resultado: res });
        this.setState({ cargando: false }); 
        if ( this.props.id_ticket ) {
          http._GET(Server + "configuracion/usuario.php?accion=get_ticket_por_usuario&id_ticket="+this.props.id_ticket).then(res => {
            if (res.err == "false") {
              this.visualizarTicketAbierta(res.ticket);
            }
          }).catch(err => console.log(err));
        }           
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
          height: '125px',
          width: '100%',
        }}>

        {(parseInt(ticket.estado) == 0) ? 
          <div style={{ fontSize: 8, whiteSpace: 'pre-wrap' }}>
            <b>Fase:</b> {ticket.fase_ticket} <b>Fecha:</b> { ticket.programada == 1 ? ticket.fecha_programada  :  ticket.creacion } &nbsp;
            { ticket.programada == 1 &&
              <Icon type="calendar" theme="filled" style={{ color: '#ffab00', fontSize: 18, marginRight: 5 }} /> 
            }
          </div>
          :
          <div style={{ fontSize: 8, whiteSpace: 'pre-wrap' }}>
            <b>Fecha Cierre:</b> {ticket.fecha_fin } 
          </div>
        }

        {(parseInt(ticket.estado) == 1 && ticket.calificacion == null  && modalidad == 'tickets_abiertas') &&
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', fontSize: 10, whiteSpace: 'pre-wrap' }}>
            <div style={{ backgroundColor: '#F4D03F', color: 'black', width: '55%', borderRadius: 4, padding: '1px' }}>
              ¡Pendiente de Calificar!
            </div>
          </div>
        }

        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: '30%', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <img src={require('../../media/ticket.png')} alt="actico" width="100px" />
          </div>
          <div style={{ width: '70%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap' }}>
              <h4>{ticket.nombre_ticket}</h4>
            </div>
            <div style={{ fontSize: 8, whiteSpace: 'pre-wrap' }}>
              {ticket.descripcion}
            </div>
              <div style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>
                Por {ticket.nombre_completo}
              </div>
            <div style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>
              <b>{ticket.correlativo}</b>
            </div>
          </div>

          {(parseInt(ticket.estado) == 0 || (ticket.calificacion == null && modalidad == 'tickets_abiertas')) &&
            <div style={{ padding: 5 }}>
              {(parseInt(ticket.estado) == 0) &&
                <Progress strokeLinecap="square" type="circle" percent={parseInt((parseInt(ticket.total_fases_ticket - 1) * 100) / parseInt(ticket.total_fases))} width={50} />
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