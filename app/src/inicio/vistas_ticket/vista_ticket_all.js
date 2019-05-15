import React, { Component } from 'react';

import Rodal from 'rodal';
import { Rate, Dropdown, Menu, Icon, Divider, Tabs, Input, Tooltip, message, Select, Button } from 'antd';
import http from '../../services/http.services';

var moment = require('moment');
//var esLocale = require('moment/locale/es');

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { TextArea } = Input;

class ver_ticket_abierta extends Component {

  constructor() {
    super();
    this.state = {
      ticket: undefined,
      calificacion_fase_anterior: 0,
      mensaje_a_enviar: '',
      frm_calificacion_general: 0,
      frm_tiempo_espera: 0,
      frm_amabilidad: 0,
      frm_conocimiento: 0,
      modal_transferirTicket: false,
      soporte_compatible: [],
      id_usuario_transferir: undefined,
    }
  }

  componentWillMount() {
    this.cargarTicket(this.props.id_usuario_ticket);
  }

  componentDidUpdate() {
    if (this.messagesEnd) {
      this.messagesEnd.scrollTop = this.messagesEnd.scrollHeight;
    }
  }

  render() {

    const menu = (
      <Menu>
        <Menu.Item key="1" style={{ color: '#2980B9' }} onClick={() => { this.solicitarTransferir() }}><Icon type="team" />Transferir Ticket</Menu.Item>
      </Menu>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%' }}>
        {this.modalTransferirTicket()}
        {this.state.ticket &&
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '55%', height: '100%', alignItems: 'center', }}>
                {(parseInt(this.state.ticket.estado) == 0 && this.props.modalidad == 'soporte') &&
                  <div style={{ display: 'flex', flex: 0, width: '100%', backgroundColor: 'transparent', justifyContent: 'flex-start' }}>
                    <Dropdown overlay={menu} trigger='click'>
                      <Button style={{ marginLeft: 8, border: 'none', outline: 'none', }}>
                        <Icon type="setting" style={{ fontSize: 23, color: '#909497' }} />
                      </Button>
                    </Dropdown>
                  </div>
                }

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  {(this.state.ticket != undefined) && <h2 style={{ textAlign: 'center', marginTop: 10 }}>{this.state.ticket.nombre_ticket}</h2>}
                  {(this.state.ticket != undefined) && <div style={{ textAlign: 'center', color: 'black' }}>Por {this.state.ticket.nombre_completo} del Dpto. de {this.state.ticket.departamento}</div>}
                  {(this.state.ticket != undefined) && <div style={{ textAlign: 'center' }}>{this.state.ticket.categoria}>{this.state.ticket.sub_categoria}</div>}
                </div>

                {(this.state.ticket != undefined) &&
                  <div style={{ display: 'flex', width: '80%', height: '30%', overflowY: 'auto', padding: '20px', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'justify', whiteSpace: 'pre-wrap', marginTop: 20, backgroundColor: '#ECF0F1', borderRadius: 7 }}>
                    {this.state.ticket.descripcion}
                  </div>
                }

                {(this.state.ticket != undefined) &&
                  <div style={{ display: 'flex', flexDirection: 'column', width: '80%', height: '30%', overflowY: 'auto', padding: '20px', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'justify', whiteSpace: 'pre-wrap', marginTop: 20, backgroundColor: '#ECF0F1', borderRadius: 7 }}>
                    <label style={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>Inf. Adicional</label>
                    {this.state.ticket.info_adicional && <label>{this.state.ticket.info_adicional}</label>}
                    {!this.state.ticket.info_adicional && <label style={{ width: '100%', textAlign: 'center' }}>Sin información adicional.</label>}
                  </div>
                }
              </div>
              <div style={{ flexDirection: 'column', display: 'flex', flex: 1, width: '45%', height: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                 
                  {(parseInt(this.state.ticket.estado) == 0) ?
                    <div style={{ backgroundColor: '#ECF0F1', display: 'flex', flex: 1, flexDirection: 'row', borderRadius: 13, padding: '7px', paddingLeft: '15px', alignItems: 'center', boxShadow: '0px 1px 4px #909497' }}>
                      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', lineHeight: 1 }}>  <Icon type="fire" theme="filled" style={{ marginRight: 5, fontSize: 18, color: String(this.printFaseActual().color) }} /><h4 style={{ lineHeight: 1 }}>{this.printFaseActual().fase}</h4></div>
                        <div style={{ fontSize: 9, }}>Soporte por <b> {this.printFaseActual().nombre_tecnico} </b></div>
                      </div>
                      {this.props.modalidad == 'soporte' &&
                        <Tooltip title="Pasar ticket a la siguiente fase">
                          <Button onClick={this.siguienteFase.bind(this)} disabled={this.state.cargando} style={{ display: 'flex', flex: 0, backgroundColor: 'transparent', border: 'none', outline: 'none' }}>
                            <Icon type="caret-right" style={{ color: '#5D6D7E', fontSize: 30 }} />
                          </Button>
                        </Tooltip>
                      }
                    </div>
                    :
                    <div style={{ backgroundColor: '#ECF0F1', display: 'flex', flex: 1, flexDirection: 'row', borderRadius: 13, padding: '7px', paddingLeft: '15px', alignItems: 'center', boxShadow: '0px 1px 4px #909497' }}>
                      <Icon type="check-circle" theme="filled" style={{ color: '#ADD825', fontSize: 30, marginRight: 8 }} />
                      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <h4 style={{ lineHeight: 1 }}>Ticket Finalizada</h4>
                          <div style={{ fontSize: 9, }}>Finalizada por {this.printUltimaFase().nombre_tecnico}</div>
                        </div>
                      </div>
                    </div>
                  }

                  {(this.props.modalidad == 'usuario') &&
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20, fontSize: 9, alignItems: 'center' }}>
                      { /* parseInt(this.state.ticket.estado) == 0 &&
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', }}>
                          {(this.state.calificacion_fase_anterior == 0) && <label style={{ width: '100%', textAlign: 'center', lineHeight: 1.3 }}>Califica el proceso hasta ahora</label>}
                          {(this.state.calificacion_fase_anterior > 0) && <label style={{ width: '100%', textAlign: 'center', lineHeight: 1.3 }}>Podrás volver calificar al finalizar la fase actual</label>}
                          <Rate disabled={(this.state.calificacion_fase_anterior > 0) ? true : false} onChange={this.puntuarFaseAnterior.bind(this)} value={this.state.calificacion_fase_anterior} />
                        </div>
                      */}
                      {parseInt(this.state.ticket.estado) == 1 &&
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '5px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: this.Numero(this.state.ticket.id_calificacion) == 0 ? '#3498DB' : '#F7DC6F' }}>
                          {this.Numero(this.state.ticket.id_calificacion) == 0 &&
                            <div>
                              <h4 style={{ lineHeight: 0 }}>¡Ayudanos a mejorar!</h4>
                              <label style={{ fontSize: 10 }}>Contestando esta pequeña encuesta:</label>
                            </div>
                          }
                          {this.Numero(this.state.ticket.id_calificacion) != 0 &&
                            <div>
                              <h4 style={{ lineHeight: 0 }}>¡Gracias por ayudarnos a mejorar!</h4>
                              <label style={{ fontSize: 10, fontWeight: 'bold', color: '#9BDE53' }}><Icon type="check" /> Calificación enviada</label>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>

                {this.props.modalidad == 'usuario' &&
                  <div style={{ display: 'flex', flex: 1 }}>
                    {this.renderTabMensajes()}
                  </div>
                }

                {this.props.modalidad == 'soporte' &&
                  <Tabs tabBarGutter={5} defaultActiveKey={'1'} style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%', width: '100%' }}>
                    <TabPane key={1} tab={"Chat"} style={{ display: 'flex', height: '295px', width: '100%' }}>
                      <div style={{ display: 'flex', flex: 1, height: '100%', padding: '10px' }}>
                        {this.renderTabMensajes()}
                      </div>
                    </TabPane>
                    <TabPane key={2} tab={"Tiempos"} style={{ display: 'flex', height: '295px', width: '100%' }}>
                      <div style={{ display: 'flex', flex: 1, height: '100%' }}>
                        {this.renderTiempos()}
                      </div>
                    </TabPane>
                    <TabPane key={3} tab={"Procedimiento"}>
                      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '10px', overflowY: 'auto', fontSize: 13 }}>
                        <h4 style={{ textAlign: 'center', marginBottom: 7 }}>Procedimiento Sugerido</h4>
                        {this.state.ticket.procedimiento}
                      </div>
                    </TabPane>
                    { this.state.ticket.archivos.length > 0 &&
                    <TabPane key={4} tab={"Adjuntos"}>
                      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '10px', overflowY: 'auto', fontSize: 13 }}>
                        <h4 style={{ textAlign: 'center', marginBottom: 7 }}>Archivos adjuntos por el usuario</h4>
                        {this.state.ticket.archivos.map((res , i) => {
                          return(
                            <Button style={{ marginLeft: 8, border: 'none', outline: 'none', }}>
                              <a href={this.props.Server + 'download.php?ruta='+res.ruta+'&name='+res.nombre} target="_blank">{res.nombre}</a>
                              <Icon type="download" style={{ fontSize: 23, color: '#909497' }} />
                            </Button>
                          )
                        })}
                      </div>
                    </TabPane>
                    }
                  </Tabs>
                }
              </div>
            </div>
            {/*aqui iria el 10%*/}
          </div>
        }
      </div>
    );
  }

  solicitarTransferir() {
    this.getSoporteCompatible();
    this.setState({ modal_transferirTicket: true });
  }

  solicitarEliminar() {

  }

  modalTransferirTicket() {
    return (
      <Rodal
        animation={'fade'}
        visible={this.state.modal_transferirTicket}
        onClose={() => { this.setState({ modal_transferirTicket: false, id_usuario_transferir: undefined }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10, height: '30%', width: '40%' }}
      >
        {(this.state.modal_transferirTicket) &&
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center' }}>
            <div style={{ height: '70%', width: '100%', textAlign: 'center', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
              <h4 style={{ textAlign: 'center', lineHeight: 1 }}>
                ¿A quién deseas transferir esta Ticket?
              </h4>
              <Divider style={{ margin: '0px', marginBottom: 20 }} />
              <Select
                showSearch
                autoClearSearchValue
                style={{ width: 280 }}
                placeholder="Selecciona"
                optionFilterProp="children"
                onChange={(seleccion) => { this.setState({ id_usuario_transferir: seleccion }) }}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {this.state.soporte_compatible.map((soporte) => (
                  <Option value={soporte.id_usuario}>{String(soporte.nombre_completo)}</Option>
                ))}
              </Select>
            </div>
            <div style={{ display: 'flex', height: "10%", justifyContent: 'center' }}>
              <Button disabled={this.state.cargando} onClick={this.enviarTicketTransferida.bind(this)} type="primary" style={{ display: 'flex', width: '60%', justifyContent: 'center' }}>
                Transferir
              </Button>
            </div>
          </div>
        }
      </Rodal>
    )
  }

  getSoporteCompatible() {
    let Server = String(this.props.Server);
    var data = new FormData();
    data.append('id_usuario_ticket', this.state.ticket.id_usuario_ticket);
    this.setState({ cargando: true });

    http._POST(Server + 'configuracion/ticket.php?accion=get_soporte_compatible', data).then((res) => {
      if (res !== 'error') {
        this.setState({ soporte_compatible: res });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Soporte Compatible.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Soporte Compatible." + err);
      this.setState({ cargando: false });
    });
  }

  enviarTicketTransferida() {
    let Server = String(this.props.Server);
    var data = new FormData();
    data.append('id_usuario_ticket', this.state.ticket.id_usuario_ticket);
    data.append('id_usuario', this.state.id_usuario_transferir);
    data.append('id_tecnico', this.props.id_usuario);
    this.setState({ cargando: true });

    http._POST(Server + 'configuracion/ticket.php?accion=enviar_ticket_transferida', data).then((res) => {
      if (res == 'ok') {
        message.info("Se ha enviado la solicitud de transferencia.");
        this.setState({ modal_transferirTicket: false, id_usuario_transferir: undefined , cargando: false });
      } else {
        message.error("Error al cargar Soporte Compatible.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Soporte Compatible." + err);
      this.setState({ cargando: false });
    });
  }

  siguienteFase() {
    let Server = String(this.props.Server)
    this.setState({ cargando: true })
    var data = new FormData();
    data.append('id_usuario', this.props.id_usuario);
    data.append('id_usuario_ticket', this.state.ticket.id_usuario_ticket);

    http._POST(Server + 'configuracion/ticket.php?accion=siguiente_fase', data).then((res) => {
      if (res !== 'error') {
        this.setState({ cargando: false });
        this.props.getTicketsAbiertas();
        this.cargarTicket(this.state.ticket.id_usuario_ticket);

        var data = new FormData();
        data.append('para', res.para);
        data.append('mensaje', res.mensaje);
        if (res.copia) {
          data.append('copia', res.copia);
        }
        http._POST(Server + "mail.php?accion=set" , data).catch(err => console.log(err));
      } else {
        message.error("Error al cambiar de fase.");
        this.setState({ cargando: false })
      }
    }).catch(err => {
      message.error("Error al cambiar de fase." + err);
      this.setState({ cargando: false });
    });
  }

  renderTiempos() {
    let fases = JSON.parse(this.state.ticket.fases);
    let ultima_fase = [];
    let tiempo = "";

    if (parseInt(this.state.ticket.estado) == 0) {
      tiempo = moment(this.state.ticket.creacion).fromNow();
    } else {
      /////////ultima fase
      ultima_fase = fases[fases.length - 1];
      var timeStart = new Date(this.state.ticket.creacion);
      var timeEnd = new Date(ultima_fase.fecha_fin);
      var difference = timeEnd - timeStart;
      tiempo = moment.duration(difference).humanize();
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        {parseInt(this.state.ticket.estado) == 0 &&
          <div style={{ width: '100%', textAlign: 'center', marginBottom: 10 }}>
            Ticket abierta <label style={{ fontWeight: 'bold' }}>{tiempo}</label>
          </div>
        }
        {parseInt(this.state.ticket.estado) == 1 &&
          <div style={{ width: '100%', textAlign: 'center', marginBottom: 10 }}>
            Ticket resuelta en <label style={{ fontWeight: 'bold' }}>{tiempo}</label>
          </div>
        }

        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%', overflowY: 'auto' }}>
          {fases.map((fase, i) => (
            <div key={i} style={{ boxShadow: '0px 1px 4px #909497', display: 'flex', flexDirection: 'column', backgroundColor: String(fase.color), borderRadius: 12, padding: '10px', marginBottom: 10, }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <label style={{ fontWeight: 'bold' }}>{fase.fase}</label>
                <label style={{ fontSize: 10, textAlign: 'right', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-start' }}>
                  {parseInt(fase.calificacion_fase) > 0 &&
                    <div>
                      <Rate disabled={true} value={parseInt(fase.calificacion_fase)} style={{ fontSize: 15, backgroundColor: 'rgba(255, 255, 255, 1)', borderRadius: 10, paddingLeft: '10px', paddingBottom: '3px' }} />
                    </div>
                  }
                  Soporte por {fase.nombre_tecnico}
                </label>
              </div>
              {parseInt(fase.estado) == 0 &&
                <label>
                  Fase abierta <label style={{ fontWeight: 'bold', color: '#1F618D' }}>{moment(fase.fecha_inicio).fromNow()}</label>
                </label>
              }
              {parseInt(fase.estado) == 1 &&
                <label>
                  Duración total: {this.diferencia(fase)}
                </label>
              }
            </div>
          ))}
        </div>
      </div>
    )
  }

  diferencia(fase) {
    var timeStart = new Date(fase.fecha_inicio);
    var timeEnd = new Date(fase.fecha_fin);
    var difference = timeEnd - timeStart;
    var tiempo = moment.duration(difference).humanize();

    return (
      <label style={{ fontWeight: 'bold', color: '#1F618D' }}>
        {tiempo}
      </label>
    )
  }

  renderTabMensajes() {
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#F0F3F4', borderRadius: 13, boxShadow: '0px 1px 4px #909497' }}>
        {(this.props.modalidad == 'soporte' || parseInt(this.state.ticket.estado) == 0 || this.Numero(this.state.ticket.id_calificacion) > 0) &&
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', flex: 1, height: '100%', }}>
              {this.printMensajes()}
            </div>
            {(parseInt(this.state.ticket.estado) == 0) &&
              <div style={{ display: 'flex', flexDirection: 'row', height: '20%', marginBottom: 5, marginRight: 5, marginLeft: 5, border: '1px solid #ECF0F1', borderRadius: 13 }}>
                <TextArea onChange={this.mesdnsajeSet.bind(this)} rows={4} style={{ width: '70%', height: '100%', backgroundColor: '#FBFCFC', borderRadius: 13, overflowY: 'hidden' }} placeholder="Enviar un mensaje" />
                <Button disabled={this.state.cargando} onClick={this.enviarMensaje.bind(this)} type="primary" htmlType="submit" style={{ width: '30%', borderRadius: 13, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  Enviar
            </Button>
              </div>
            }
          </div>
        }
        {(this.Numero(this.state.ticket.id_calificacion) == 0 && parseInt(this.state.ticket.estado) == 1 && this.props.modalidad == 'usuario') &&
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ height: '95%', width: '95%', backgroundColor: 'white', borderRadius: 13, boxShadow: '0px 1px 1px #909497' }}>
              <h4 style={{ marginTop: 7, textAlign: 'center' }}>Puntea lo siguiente</h4>
              <div style={{ width: '100%', paddingLeft: '10px', paddingRight: '10px', lineHeight: 1.5, marginTop: 10 }}>
                <label style={{ fontSize: 13 }}>1. Satisfacción general</label>
                <div style={{ width: '100%', textAlign: 'center' }}><Rate onChange={(valor) => { this.setState({ frm_calificacion_general: valor }, () => { this.enviarCalificacion() }) }} value={this.state.frm_calificacion_general} style={{}} /></div>
              </div>
              <div style={{ width: '100%', paddingLeft: '10px', paddingRight: '10px', lineHeight: 1.5, marginTop: 10 }}>
                <label style={{ fontSize: 13 }}>2. Tiempo de espera</label>
                <div style={{ width: '100%', textAlign: 'center' }}><Rate onChange={(valor) => { this.setState({ frm_tiempo_espera: valor }, () => { this.enviarCalificacion() }) }} value={this.state.frm_tiempo_espera} style={{}} /></div>
              </div>
              <div style={{ width: '100%', paddingLeft: '10px', paddingRight: '10px', lineHeight: 1.5, marginTop: 10 }}>
                <label style={{ fontSize: 13 }}>3. Amabilidad</label>
                <div style={{ width: '100%', textAlign: 'center' }}><Rate onChange={(valor) => { this.setState({ frm_amabilidad: valor }, () => { this.enviarCalificacion() }) }} value={this.state.frm_amabilidad} style={{}} /></div>
              </div>
              <div style={{ width: '100%', paddingLeft: '10px', paddingRight: '10px', lineHeight: 1.5, marginTop: 10 }}>
                <label style={{ fontSize: 13 }}>4. Conocimiento del procedimiento</label>
                <div style={{ width: '100%', textAlign: 'center' }}><Rate onChange={(valor) => { this.setState({ frm_conocimiento: valor }, () => { this.enviarCalificacion() }) }} value={this.state.frm_conocimiento} style={{}} /></div>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }

  enviarCalificacion() {
    if (parseInt(this.state.frm_calificacion_general) > 0 && parseInt(this.state.frm_tiempo_espera) > 0 && parseInt(this.state.frm_amabilidad) > 0 && parseInt(this.state.frm_conocimiento) > 0) {
      let Server = String(this.props.Server)
      this.setState({ cargando: true })
      var data = new FormData();
      data.append('nivel_satisfaccion', this.state.frm_calificacion_general);
      data.append('tiempo_espera', this.state.frm_tiempo_espera);
      data.append('amabilidad', this.state.frm_amabilidad);
      data.append('conocimientos', this.state.frm_conocimiento);
      data.append('id_usuario_ticket', this.state.ticket.id_usuario_ticket);

      http._POST(Server + 'configuracion/ticket.php?accion=puntuar_ticket', data).then((res) => {
        if (res !== 'error') {
          this.setState({ cargando: false });
          this.props.getTicketsAbiertas();
          message.success("Calificación enviada!");
          this.cargarTicket(this.state.ticket.id_usuario_ticket);
        } else {
          message.error("Error al enviar calificación.");
          this.setState({ cargando: false });
        }
      }).catch(err => {
        message.error("Error al enviar calificación." + err);
        this.setState({ cargando: false });
      });
    }
  }

  printMensajes() {
    let mensajes = JSON.parse(this.state.ticket.mensajes);

    return (
      <div ref={(el) => { this.messagesEnd = el }} style={{ height: '100%', width: '100%', overflowY: 'auto', paddingTop: 10 }}  >
        {mensajes.map((mensaje, i) => (
          <div key={i} style={{ display: 'flex', fontSize: 10, width: '100%', justifyContent: (parseInt(mensaje.id_usuario) == parseInt(this.props.id_usuario)) ? 'flex-end' : 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: 'auto', width: '60%', borderRadius: 10, marginBottom: 10, padding: '5px', marginLeft: 10, marginRight: 10, backgroundColor: (parseInt(mensaje.id_usuario) == parseInt(this.props.id_usuario)) ? '#82E0AA' : '#D0D3D4' }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}><label style={{ fontWeight: 'bold' }}>{mensaje.nombre_completo}</label> <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', fontSize: 8 }}> {moment(mensaje.fecha).fromNow()} </div> </div>
              <label>{mensaje.mensaje}</label>
            </div>
          </div>
        ))}
        {mensajes.length == 0 &&
          <div style={{ width: '100%', textAlign: 'center', fontSize: 10, marginTop: 10 }}>
            {(parseInt(this.state.ticket.estado) == 0) &&
              <label>Aún no se han enviado mensajes...</label>
            }
            {(parseInt(this.state.ticket.estado) == 1) &&
              <label>No se enviaron mensajes...</label>
            }
          </div>
        }
      </div>
    )
  }

  mesdnsajeSet(obj) {
    this.setState({ mensaje_a_enviar: obj.target.value });
  }

  enviarMensaje() {

    if (this.state.mensaje_a_enviar) {
      let Server = String(this.props.Server);
      this.setState({ cargando: true });
      var data = new FormData();
      data.append('mensaje', this.state.mensaje_a_enviar);
      data.append('id_usuario', this.props.id_usuario);
      data.append('id_usuario_ticket', this.state.ticket.id_usuario_ticket);

      http._POST(Server + 'configuracion/ticket.php?accion=put_mensaje', data).then((res) => {
        if (res !== 'error') {
          this.setState({ cargando: false, mensaje_a_enviar: undefined });
          this.cargarTicket(this.state.ticket.id_usuario_ticket);
        } else {
          message.error("Error al enviar mensaje.");
          this.setState({ cargando: false })
        }
      }).catch(err => {
        message.error("Error al enviar mensaje." + err);
        this.setState({ cargando: false });
      });
    } else {
      message.warn("Primero escribe un mensaje.");
    }
  }

  printFaseActual() {
    let fases = JSON.parse(this.state.ticket.fases);
    let fase_actual = [];

    for (const fase of fases) {
      if (parseInt(fase.estado) == 0) {
        fase_actual = fase;
      }
    }

    return fase_actual;
  }

  printUltimaFase() {
    let fases = JSON.parse(this.state.ticket.fases);
    let fase_ultima = [];

    for (const fase of fases) {
      fase_ultima = fase;
    }

    return fase_ultima;
  }

  puntuarFaseAnterior(valor) {

    this.setState({ calificacion_fase_anterior: valor });
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    ///////fase anterior
    let fases = JSON.parse(this.state.ticket.fases);

    let fase_anterior = [];
    let fase_actual = [];

    for (const fase of fases) {
      if (parseInt(fase.estado) == 0) {
        fase_actual = fase;
      } else {
        fase_anterior = fase;
      }
    }

    var data = new FormData();
    data.append('id_usuario_ticket_fase', fase_anterior.id_usuario_ticket_fase);
    data.append('calificacion_fase', valor);

    http._POST(Server + 'configuracion/ticket.php?accion=puntuar_fase', data).then((res) => {
      if (res !== 'error') {
        this.setState({ cargando: false });
        message.success("Calificación Enviada! Gracias por ayurnos a mejorar!");
        this.cargarTicket(this.state.ticket.id_usuario_ticket);
      } else {
        message.error("Error al enviar calificación.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al enviar calificación." + err);
      this.setState({ cargando: false });
    });
  }

  cargarTicket(id_usuario_ticket) {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var data = new FormData();
    data.append('id_usuario_ticket', id_usuario_ticket);

    http._POST(Server + 'configuracion/ticket.php?accion=get_previsualizar_ticket', data).then((res) => {
      if (res !== 'error') {
        this.setState({ ticket: undefined }, () => {
          this.setState({ ticket: res }, () => {
            this.verificamosCalificacion()
          })
        });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Ticket.");
        this.setState({ cargando: false })
      }
    }).catch(err => {
      message.error("Error al cargar Ticket." + err);
      this.setState({ cargando: false });
    });
  }

  verificamosCalificacion() {
    ///////fase anterior
    let fases = JSON.parse(this.state.ticket.fases);
    let fase_anterior = [];
    let fase_actual = [];
    for (const fase of fases) {
      if (parseInt(fase.estado) == 0) {
        fase_actual = fase;
      } else {
        fase_anterior = fase;
      }
    }
    if (parseInt(fase_anterior.calificacion_fase) > 0) {
      this.setState({ calificacion_fase_anterior: fase_anterior.calificacion_fase });
    }
  }

  Numero(string) {
    if (string) {
      var numero = string.match(/\d+/);
      if (numero) {
        return parseInt(numero);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
}

export default ver_ticket_abierta;