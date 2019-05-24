import React, { Component } from 'react';

import PestaniaTicketsUsuario from "./vistas_ticket/pestania_tickets_usuario";
import Rodal from 'rodal';
import { Menu,  Dropdown, Tabs, message, Button } from 'antd';
import http from '../services/http.services';

const TabPane = Tabs.TabPane;
var moment = require('moment');
require("moment/min/locales.min");
moment.locale('es');

class inicio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notificaciones: [],
      modal_PrevisualizarTicket: false,
      ticket_abierta: undefined,
      visible_notificaciones: false,
      num : 0 ,
      id_ticket : ( this.props.req ) ?  this.props.req.match.params.ticket : undefined
    }    
  }

  componentDidMount() {    
    this.getNotificaciones(0);    
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: "10px", height: '100%', width: '100%' }}>
        {this.modalPrevisualizarTicket()}
        <div style={{ display: 'flex', width: '100%',  paddingLeft : '1%'}}>
          <div style={{ display: 'flex', flex: 1, width: '30%' }}>
            {this.state.notificaciones.length > 0 &&
              <Dropdown overlay={this.renderNotificaciones()} placement='bottomRight'
                onVisibleChange={this.handleVisibleChange}
                visible={this.state.visible_notificaciones}
              >
                <img src={require("../media/alarma.png")} /> 
              </Dropdown>
            }
          </div>
        </div>
        <Tabs defaultActiveKey={'1'} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', }}>
          { this.props.accesos['Ver_Tickets_Abiertos'] &&
            <TabPane forceRender key={1} tab={"Tickets Abiertos"}>
              <PestaniaTicketsUsuario accesos={this.props.accesos} id_ticket={this.state.id_ticket} Server={this.props.Server} id_usuario={this.props._usuario} rol={this.props.rol} modalidad='tickets_abiertas' />
            </TabPane>
          }
          { this.props.accesos['Ver_Tickets_Cerrados'] &&
            <TabPane key={2} tab={"Tickets Cerradas"}>
              <PestaniaTicketsUsuario accesos={this.props.accesos} Server={this.props.Server} id_usuario={this.props._usuario} rol={this.props.rol} modalidad='tickets_cerradas' />
            </TabPane>
          }
          { this.props.accesos['Ver_Tickets_Abiertos_Soporte'] &&
            <TabPane key={3} tab={"Soporte - Tickets Abiertas"}>
              <PestaniaTicketsUsuario accesos={this.props.accesos} id_ticket={this.state.id_ticket} Server={this.props.Server} id_usuario={this.props._usuario} rol={this.props.rol} modalidad='tickets_abiertas_soporte' />
            </TabPane>
          }
          { this.props.accesos['Ver_Tickets_Cerrados_Soporte'] &&
            <TabPane key={4} tab={"Soporte - Tickets Cerradas"}>
              <PestaniaTicketsUsuario accesos={this.props.accesos} Server={this.props.Server} id_usuario={this.props._usuario} rol={this.props.rol} modalidad='tickets_cerradas_soporte' />
            </TabPane>
          }
        </Tabs>
      </div>
    );
  }

  renderNotificaciones() {
    let colors = ['white', '#F4F6F7'];
    return (
      <div style={{
        height: '340px',
        width: '400px',
        overflowY: 'auto',
        backgroundColor: 'white',
        padding: '10px',
        boxShadow: '0px 1px 4px #909497',
        borderRadius: 10,
        border: 'none',
        borderColor: 'black',
        outline: 'none',
      }}>

        {Object.keys(this.state.notificaciones).length == 0 &&
          <div> Sin notificaciones... </div>
        }

        {Object.keys(this.state.notificaciones).length > 0 &&
          <Menu style={{ border: 'none', }}>

            {this.state.notificaciones.map((notificacion, index) => (
              <Menu.Item item={notificacion} key={notificacion.id_notificacion} style={{ lineHeight: 1.5, height: '100%', backgroundColor: colors[index % 2], fontSize: 12 }}>
                <Button onClick={() => { this.handleNotificacion(notificacion) }} style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', height: '100%', width: '100%' }}>
                  <div style={{ marginTop: 10, marginBottom: 10, whiteSpace: 'pre-wrap', textAlign: 'justify', width: '100%' }}>
                    <div style={{ display: 'flex', flex: 0, width: '100%', justifyContent: 'flex-end', fontSize: 11, color: '#3498DB' }}>{moment(notificacion.creacion).fromNow()}</div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: 14 }}>{notificacion.titulo}</h4>
                    </div>
                    {notificacion.descripcion}
                  </div>
                </Button>
              </Menu.Item>
            ))}
            <Button inlineindent="24" onClick={this.handleCargarMas.bind(this)}  style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', height: '100%', width: '100%' }}>
              Cargar Más
            </Button>
          </Menu>
        }
      </div>
    )
  }

  handleNotificacion(notificacion) {
    switch (notificacion.accion) {
      case "ver_ticket_all":
        //this.previsualizarTicket(notificacion.accion_key, 'normal')
        break;
      case "ver_ticket_aceptar":
        this.previsualizarTicket(notificacion.accion_key, 'normal' );
        break;
      case "ver_ticket_aceptar_transferida":
        this.previsualizarTicket(notificacion.accion_key, 'solicitud');
        break;
      case "y":
        break;
    }
  }

  handleVisibleChange = (flag) => {
    this.setState({ visible_notificaciones: flag });
  }

  handleCargarMas() {
    var n = parseInt(this.state.num) + 10;
    this.setState({num : n});
    this.getNotificaciones(n);
  }

  getNotificaciones(n) {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var data = new FormData();
    data.append('id_usuario', this.props._usuario);

    http._POST(Server + 'configuracion/notificaciones.php?accion=get_notificaciones_usuario&num='+n, data).then((res) => {
      if (res !== 'error') {
        var noti = this.state.notificaciones.concat(res);
        this.setState({ notificaciones: noti , cargando: false });
      } else {
        message.error("Error al cargar Notificaciones.");
        this.setState({ cargando: false })
      }
    }).catch(err => {
      message.error("Error al cargar Notificaciones." + err);
      this.setState({ cargando: false });
    });
  }

  previsualizarTicket(id, modo ) {
    this.setState({ visible_notificaciones: false, modo_previsualizar: modo })
    this.cargarTicketAbierta(id)
    this.setState({ modal_PrevisualizarTicket: true, modo_previsualizar: modo })
  }

  modalPrevisualizarTicket() {
    return (
      <Rodal
        animation={'zoom'}
        visible={this.state.modal_PrevisualizarTicket}
        onClose={() => { this.setState({ modal_PrevisualizarTicket: !this.state.modal_PrevisualizarTicket }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10, height: '50%', width: '50%' }}
      >
        {(this.state.modal_PrevisualizarTicket && this.state.ticket_abierta) &&
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', height: '60%', width: '100%', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', width: '70%', height: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', lineHeight: 0 }}>
                  {(this.state.ticket_abierta != undefined) && <h2 style={{ textAlign: 'center' }}>{this.state.ticket_abierta.nombre_ticket}</h2>}
                  {(this.state.ticket_abierta != undefined) && <div style={{ textAlign: 'center' }}>{this.state.ticket_abierta.categoria}>{this.state.ticket_abierta.sub_categoria}</div>}
                </div>
                {(this.state.ticket_abierta != undefined) &&
                  <div style={{ display: 'flex', width: '100%', height: '100%', padding: '20px', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'justify', whiteSpace: 'pre-wrap', marginTop: 20, backgroundColor: '#ECF0F1', borderRadius: 7 }}>
                    {this.state.ticket_abierta.descripcion}
                  </div>
                }
              </div>
              <div style={{ display: 'flex', width: '30%', height: '90%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ overflowY: 'auto', overflowX: 'hidden', fontSize: 12, marginTop: 30, display: 'flex', width: '90%', height: '100%', flexDirection: 'column', textAlign: 'center', alignItems: 'center', backgroundColor: '#ECF0F1', borderRadius: 7 }}>
                  <div style={{ padding: '10px' }}>
                    {this.state.ticket_abierta.info_adicional &&
                      <div>
                        <h4 style={{ fontSize: 14 }}>Inf. Adicional</h4>
                        {this.state.ticket_abierta.info_adicional}
                      </div>
                    }
                    {!this.state.ticket_abierta.info_adicional &&
                      <div>
                        <h4>Inf. Adicional</h4>
                        Sin información adicional.
                    </div>
                    }
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', height: '20%', width: '100%', justifyContent: 'flex-start', alignItems: 'center' }}>
              <div style={{ width: '50%' }}>
                <h4>Usuario: </h4> &nbsp;&nbsp;&nbsp;{this.state.ticket_abierta.nombre_completo} del Dpto. de {this.state.ticket_abierta.departamento}.
              </div>
              {(parseInt(this.state.ticket_abierta.programada) == 1) &&
                <div style={{ width: '50%' }}>
                  <h4>Programada para el: </h4> &nbsp;&nbsp;&nbsp;{moment(this.state.ticket_abierta.fecha_programada).calendar().charAt(0).toUpperCase() + moment(this.state.ticket_abierta.fecha_programada).calendar().slice(1)}.
              </div>
              }
            </div>
            <div style={{ display: 'flex', height: "20%", width: '100%', justifyContent: 'center', alignItems: 'flex-end' }}>
              <Button disabled={this.state.cargando} type="primary" onClick={() => { this.tomarTicket(this.state.ticket_abierta.id_usuario_ticket) }} style={{ display: 'flex', width: '50%', justifyContent: 'center', backgroundColor: '#17A589', borderColor: 'transparent' }}>
                {(this.state.modo_previsualizar == 'normal') &&
                  <label>Tomar Ticket</label>
                }
                {(this.state.modo_previsualizar == 'solicitud') &&
                  <label>Aceptar Ticket</label>
                }
              </Button>
              {(this.state.modo_previsualizar == 'solicitud') &&
                <Button disabled={this.state.cargando} type="danger" onClick={() => { this.noTomarTicket(this.state.ticket_abierta.id_usuario_ticket) }} style={{ display: 'flex', marginLeft: 20, width: '20%', justifyContent: 'center', borderColor: 'transparent' }}>
                  No Aceptar
              </Button>
              }
            </div>
          </div>
        }
      </Rodal>
    )
  }

  cargarTicketAbierta(id_usuario_ticket) {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var data = new FormData();
    data.append('id_usuario_ticket', id_usuario_ticket);
    http._POST(Server + 'configuracion/ticket.php?accion=get_previsualizar_ticket', data).then((res) => {
      if (res !== 'error') {
        this.setState({ ticket_abierta: undefined }, () => {
          this.setState({ ticket_abierta: res });
        })
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Ticket.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Ticket." + err);
      this.setState({ cargando: false });
    });
  }

  tomarTicket(id_usuario_ticket) {
    this.setState({ cargando: true });
    let Server = String(this.props.Server);
    var data = new FormData();
    data.append('id_usuario_ticket', id_usuario_ticket);
    data.append('id_tecnico', this.props._usuario);
    data.append('modo', this.state.modo_previsualizar);
    http._POST(Server + 'configuracion/ticket.php?accion=tomar_ticket', data).then((res) => {
      if (res.err == 'false') {
        this.setState({ modal_PrevisualizarTicket: false });
        message.success("Se te ha asignado esta ticket!");
        this.setState({ cargando: false });      
        if (res.para) {
          var data = new FormData();
          data.append('para', res.para);
          data.append('mensaje', res.mensaje);
          http._POST(Server + "mail.php?accion=set" , data).catch(err => console.log(err));
        }       
      } else {
        message.error(res.msn);
        this.setState({ modal_PrevisualizarTicket: false , cargando: false});
      }
    }).catch(err => {
      message.error("Ha ocurrido un error. " + err);
      this.setState({ cargando: false });
    });
  }

  noTomarTicket(id_usuario_ticket) {
    this.setState({ cargando: true });
    let Server = String(this.props.Server);
    var data = new FormData();
    data.append('id_usuario_ticket', id_usuario_ticket);
    data.append('id_tecnico', this.props._usuario);
    http._POST(Server + 'configuracion/ticket.php?accion=no_tomar_ticket' , data).then((res) => {
      if (res.err == 'false') {
        this.setState({ modal_PrevisualizarTicket: false })
        this.setState({ cargando: false });
        if ( res.copia.length > 0 ) {
          var data = new FormData();
          data.append('para', res.copia[0]); 
          data.append('mensaje', res.mensaje );
          data.append('copia', res.copia );
          http._POST(Server + 'mail.php?accion=set' , data).catch(err => console.log(err));
        }
      } else {
        message.error("Ha ocurrido un error.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Ha ocurrido un error." + err);
      this.setState({ cargando: false });
    }); 
  }
}

export default inicio;