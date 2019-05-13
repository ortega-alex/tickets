import React, { Component } from 'react';

import Rodal from 'rodal';
import { Grid } from 'semantic-ui-react'
import { Icon, DatePicker, Form, Radio, Input, Tooltip, message, Select, Button, Switch , Upload  } from 'antd';
import http from '../services/http.services';

var moment = require('moment');
var subiendo = false;

const FormItem = Form.Item;
const Option = Select.Option;
//const RadioGroup = Radio.Group;
//const RadioButton = Radio.Button;
const { TextArea } = Input;
const Search = Input.Search;

class abrir_ticket extends Component {

  constructor() {
    super();
    this.state = {
      tickets_usuario: [],
      tickets_usuario_resultado: [],
      asignaciones_usuario: [],
      texto_busqueda: '',
      asignacion_seleccionada: undefined,
      modal_Ticket: false,
      ticket_nueva: undefined,
      departamentos_usuario: undefined,
      empleados_departamento: undefined,
      frm_departamento: undefined,
      frm_empleado: undefined,
      frm_programada: false,
      ticket_usuario: undefined,
      cambiar_valores: false,
      files: FileList
    }
  }

  componentWillMount() {
    this.getTicketsUsuario();
    this.getAsignaciones();
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%' }}>
        {this.modalTicket()}
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          {(this.state.texto_busqueda !== undefined) &&
            <div style={{ display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center', }}>
              <Search
                style={{ width: 300, height: 33, marginLeft: 100, }}
                defaultValue={this.state.texto_busqueda}
                placeholder="Buscar Ticket"
                onSearch={value => this.bucarTicket(value)}
                enterButton
              />
            </div>
          }
         {/* <div style={{ display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }}>
            {(this.state.asignaciones_usuario !== [] && this.state.asignaciones_usuario.length > 1) &&
              <RadioGroup onChange={(value) => { this.cambioAsignacion(value.target.value) }} value={this.state.asignacion_seleccionada} defaultValue={this.state.asignacion_seleccionada} buttonStyle="solid">
                <RadioButton value={undefined}>Todas</RadioButton>
                {this.state.asignaciones_usuario.map((asignacion, i) => (
                  <RadioButton value={asignacion.id_cargo} key={i}>
                    <div style={{ color: undefined }}>{asignacion.puesto}</div>
                  </RadioButton>
                ))}
              </RadioGroup>
            }
          </div> */}
        </div>
        <div style={{display:'flex', flexDirection:'column',  width:'100%', borderRadius:15}}>
          {(this.state.tickets_usuario_resultado !== []) &&            
              <Grid container columns={4} padded stackable style={{height:'100%' , overflowY:'auto'}}>            
              {this.state.tickets_usuario_resultado.map((ticket, i) => (
                <Grid.Column key={i} >
                  <ItemTicket ticket={ticket} abrirTicket={this.abrirTicket.bind(this)} />
                </Grid.Column>
              ))}
            </Grid>
          }
        </div>
      </div>
    );
  }

  abrirTicket(ticket) {
    if (ticket.estado_final.estado !== 'Inactivo') {
      this.setState({ frm_departamento: ticket.id_departamento, frm_empleado: this.props.id_usuario, ticket_usuario: ticket }, () => {
        this.cargarTicket(ticket.id_ticket);
        this.getDepartamentosUsuario();
        this.getUsuariosDepartamento(ticket.id_departamento);
        this.setState({ files : FileList , modal_Ticket: true });
      })
    } else {
      message.warning("Ticket no disponible temporalmente. Perdona los inconvenientes!");
    }
  }

  cargarTicket(ticket) {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var data = new FormData();
    data.append('id_ticket', ticket);

    http._POST(Server + 'configuracion/ticket.php?accion=get_ticket', data).then((res) => {
      if (res !== 'error') {
        var resultado = {
          id_ticket: res.id_ticket,
          nombre_ticket: res.nombre_ticket,
          descripcion: res.descripcion,
          id_sub_categoria: res.id_sub_categoria,
          tiempo_estimado: res.tiempo_estimado,
          prioridad_recomendada: res.prioridad_recomendada,
          estado: res.estado,
          creacion: res.creacion,
          procedimiento: res.procedimiento,
          sub_categoria: JSON.parse(res.sub_categoria),
          categoria: JSON.parse(res.categoria),
        }
        this.setState({ ticket_nueva: undefined }, () => {
          this.setState({ ticket_nueva: resultado })
        });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Ticket.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Ticket." + err);
      this.setState({ cargando: false })
    });
  }

  modalTicket() {

    const propsUpload = {
      disabled : subiendo ,
      className : "upload-list-inline",
      onRemove:this.borrarAdjunto.bind(this),
      onChange: this.onChange,
      multiple: true,
      listType: "picture",
      customRequest: this.subirAdjunto.bind(this)
    };

    const { getFieldDecorator } = this.props.form;
    return (
      <Rodal
        animation={'zoom'}
        visible={this.state.modal_Ticket}
        onClose={() => { this.setState({ modal_Ticket: !this.state.modal_Ticket, ticket_nueva: undefined, cambiar_valores: false, frm_programada: false, ticket_usuario: undefined }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10, height: '70%', width: '50%' }}
      >
        {(this.state.modal_Ticket && this.state.ticket_nueva) &&
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%', width: '100%' }}>
            <Form onSubmit={this.aperturarTicket.bind(this)} style={{ height: "100%" }}>
              <div style={{ display: 'flex', flexDirection: 'row', height: '50%', width: '100%' }}>
                <div style={{ display: 'flex', width: '70%', height: '80%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                { this.state.departamentos_usuario && 
                  <div style={{ display: 'flex', height: '15%', width: '100%' }}>
                    <FormItem  style={{ width: '25%' , paddingTop:'10%' }}>
                      {getFieldDecorator('departamento', {
                        rules: [{ required: true, message: 'Por favor selecciona' }], initialValue: (this.state.frm_departamento ? String(this.state.frm_departamento) : undefined)
                      })(
                        <Select
                          showSearch
                          autoClearSearchValue
                          placeholder="Selecciona Departamento"
                          optionFilterProp="children"
                          onChange={(seleccion) => { this.getUsuariosDepartamento(seleccion); this.setState({ frm_departamento: seleccion }) }}
                          style={{ width: '80%' }}
                          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                          {this.state.departamentos_usuario.map((departamento) => (
                            <Option value={departamento.id_departamento}>{departamento.departamento}</Option>
                          ))}

                        </Select>
                      )}
                    </FormItem>
                  </div>
                }
                  
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', lineHeight: 0 }}>
                    {(this.state.ticket_nueva !== undefined) && <h2 style={{ textAlign: 'center' }}>{this.state.ticket_nueva.nombre_ticket}</h2>}
                    {(this.state.ticket_nueva !== undefined) && <div style={{ textAlign: 'center' }}>{this.state.ticket_nueva.categoria.categoria}>{this.state.ticket_nueva.sub_categoria.sub_categoria}</div>}
                  </div>
                  {(this.state.ticket_nueva != undefined) &&
                    <div style={{ display: 'flex', width: '100%', height: '100%', padding: '20px', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'justify', whiteSpace: 'pre-wrap', marginTop: 20, backgroundColor: '#ECF0F1', borderRadius: 7 }}>
                      {this.state.ticket_nueva.descripcion}
                    </div>
                  }
                </div>
                <div style={{ display: 'flex', width: '30%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ marginTop: 30 }}>
                    <FormItem label="Inf. Adicional:"
                      style={{ display: 'flex', flex: 1, flexDirection: 'column', textAlign: 'center', width: '100%', height: '100%', alignItems: 'center' }}
                    >
                      {getFieldDecorator('inf_adicional', { rules: [{ required: false }] })(
                        <TextArea rows={4} style={{ height: '150px' }} placeholder="Si deseas proporciona información adicional del problema." />
                      )}
                    </FormItem>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', height: '15%', width: '100%', justifyContent: 'flex-end' , marginBottom:'10px'}}>
                {(!this.state.cambiar_valores) &&
                  <div style={{ display: 'flex', height: "100%", width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                    <Button onClick={() => { this.setState({ cambiar_valores: true, frm_empleado: undefined }) }} style={{ width: '50%', justifyContent: 'center' , margin:'0' , padding: '0' }}>
                      Para un tercero 
                    </Button>
                  </div>
                }
                {/*(this.state.departamentos_usuario != undefined && this.state.cambiar_valores) &&
                  <FormItem label="Dpto." style={{ width: '25%' }}>
                    {getFieldDecorator('departamento', {
                      rules: [{ required: true, message: 'Por favor selecciona' }], initialValue: (this.state.frm_departamento ? String(this.state.frm_departamento) : undefined)
                    })(
                      <Select
                        showSearch
                        autoClearSearchValue
                        placeholder="Selecciona Departamento"
                        optionFilterProp="children"
                        onChange={(seleccion) => { this.getUsuariosDepartamento(seleccion); this.setState({ frm_departamento: seleccion }) }}
                        style={{ width: '80%' }}
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      >
                        {this.state.departamentos_usuario.map((departamento) => (
                          <Option value={departamento.id_departamento}>{departamento.departamento}</Option>
                        ))}

                      </Select>
                    )}
                  </FormItem>
                        */}
                {(this.state.empleados_departamento !== undefined && this.state.cambiar_valores) &&
                  <FormItem label="Empleado" style={{ width: '25%' }}>
                    {getFieldDecorator('sub_categoria', {
                      rules: [{ required: true, message: 'Por favor selecciona' }], initialValue: (this.state.frm_empleado ? String(this.state.frm_empleado) : undefined)
                    })(
                      <Select
                        defaultValue={(this.state.frm_empleado ? String(this.state.frm_empleado) : undefined)}
                        showSearch
                        autoClearSearchValue
                        placeholder="Selecciona Empleado"
                        optionFilterProp="children"
                        onChange={(seleccion) => { this.setState({ frm_empleado: seleccion }) }}
                        style={{ width: '80%' }}
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      >
                        {this.state.empleados_departamento.map((empleado) => (
                          <Option value={empleado.id_usuario}>{empleado.nombre_completo}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                }
                <FormItem
                  style={{ width: '20%' }}
                  label={(
                    <span>
                      Programada&nbsp;
                    <Tooltip title="Programar para ser despachada en el futuro, no ahora.">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                  {getFieldDecorator('programada', { rules: [{ required: false, }] })(
                    <Switch defaultChecked={this.state.frm_programada} onChange={(valor) => { this.setState({ frm_programada: valor }) }} />
                  )}
                </FormItem>

                {(this.state.frm_programada) &&
                  <FormItem
                    style={{ width: '30%' }}
                    label={"Fecha y Hora"}
                  >
                    {getFieldDecorator('fecha', { rules: [{ required: (this.state.frm_programada ? true : false), message: 'Por favor selecciona' }] })(
                      <DatePicker
                        style={{ width: '80%' }}
                        format="YYYY-MM-DD HH:mm:ss"
                        showTime={{ defaultValue: moment('HH:mm:ss') }}
                      />
                    )}
                  </FormItem>
                }
              </div>
              <div style={{ display: 'flex', height: "20%", width: '100%' , overflowY:'auto' }}>
                <Upload
                  {...propsUpload} 
                >
                  <Button>
                    <Icon type="upload" /> Imagen/Logo
                  </Button>
                </Upload>
              </div>
              <div style={{ display: 'flex', height: "10%", width: '100%', justifyContent: 'center', alignItems: 'flex-end' }}>
                <Button disabled={this.state.cargando} type="primary" htmlType="submit" style={{ display: 'flex', width: '90%', justifyContent: 'center' }}>
                  Aperturar
                </Button>
              </div>
            </Form>
          </div>
        }
      </Rodal>
    )
  }

  onChange(info) {
    if (subiendo == true) {
      info.file.status = "done";
      subiendo = false
      message.success(`${info.file.name} imagen adjuntada correctamente.`);
    }
  }

  subirAdjunto({ onSuccess, onError, file }){ 
    var temp = Array.from(this.state.files);
    temp.push(file);
    this.setState({ files: temp });
    subiendo = true;
  }

  borrarAdjunto(adjunto){
    var temp = Array.from(this.state.files);
    temp = temp.filter(item => {
      return adjunto.uid != item.uid;
    });
    this.setState({ files: temp });
  }

  beforeUpload(file) {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJPG) {
      message.error('Únicamente puedes subir imágenes (JPEG y PNG)!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('El tamaño de la imagen debe ser menor a 2MB!');
    }
    return isJPG && isLt2M;
  }

  aperturarTicket(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ cargando: true })
        let Server = String(this.props.Server)
        var programada = "0"
        if (this.state.frm_programada) {
          programada = "1"
        }

        var data = new FormData();
        data.append('info_adicional', !values.inf_adicional ? '' : values.inf_adicional);
        data.append('programada', programada);
        data.append('fecha_programada', moment(values.fecha).format("YYYY-MM-DD HH:mm:ss"));
        data.append('id_usuario', this.state.frm_empleado);
        data.append('id_departamento', this.state.frm_departamento);
        data.append('id_cargo', this.state.ticket_usuario.id_cargo);
        data.append('id_ticket', this.state.ticket_nueva.id_ticket);
        data.append('nivel_prioridad', this.state.ticket_nueva.prioridad_recomendada);
        if (  this.state.files.length > 0 ) {
          this.state.files.forEach((e , i) => {
            data.append('file'+i, e );
          });
        }        

        http._POST(Server + 'configuracion/ticket.php?accion=aperturar_ticket', data).then((res) => {
          if (res !== 'error') {
            this.setState({ modal_Ticket: false });
            message.success("Tickdet Enviada correctamente.");
            this.setState({ cargando: false , files : FileList });
            this.props.cerrarModalTickets();
          } else {
            message.error("Ha ocurrido un error.");
            this.setState({ cargando: false });
          }
        }).catch(err => {
          message.error("Ha ocurrido un error." + err);
          this.setState({ cargando: false });
        });
      }
    });
  }

  getDepartamentosUsuario() {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var data = new FormData();
    data.append('id_usuario', this.props.id_usuario);

    http._POST(Server + 'configuracion/usuario.php?accion=get_departamentos_one', data).then((res) => {
      if (res !== 'error') {
        this.setState({ cargando: false, departamentos_usuario: res });
      } else {
        message.error("Error al obtener departamentos.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al obtener departamentos." + err);
      this.setState({ cargando: false });
    });
  }

  getUsuariosDepartamento(departamento) {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var data = new FormData();
    data.append('id_departamento', departamento);

    http._POST(Server + 'configuracion/usuario.php?accion=get_usuarios_departamento_one', data).then((res) => {
      if (res !== 'error') {
        this.setState({ cargando: false, empleados_departamento: res });
      } else {
        message.error("Error al obtener departamentos.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al obtener departamentos." + err);
      this.setState({ cargando: false });
    });
  }

  getAsignaciones() {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var data = new FormData();
    data.append('id_usuario', this.props.id_usuario);

    http._POST(Server + 'configuracion/usuario.php?accion=get_asignaciones_one', data).then((res) => {
      if (res !== 'error') {
        this.setState({ cargando: false, asignaciones_usuario: res });
      } else {
        message.error("Error al obtener asignaciones.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al obtener asignaciones." + err);
      this.setState({ cargando: false });
    });
  }

  cambioAsignacion(id_cargo) {

    this.setState({ asignacion_seleccionada: id_cargo, tickets_usuario_resultado: [] }, () => {
      if (id_cargo !== undefined) {
        let resultado = [];
        for (const objeto of this.state.tickets_usuario) {
          if (objeto.id_cargo == id_cargo) {
            resultado.push(
              objeto
            )
          }
        }
        this.setState({ tickets_usuario_resultado: resultado });
      } else {
        this.setState({ tickets_usuario_resultado: this.state.tickets_usuario });
      }
    });

    this.setState({ texto_busqueda: undefined }, () => {
      this.setState({ texto_busqueda: '' });
    });
  }

  bucarTicket(valor) {

    this.setState({ asignacion_seleccionada: undefined });
    if (valor !== "") {
      let array = this.state.tickets_usuario;
      array = array.filter((elemento) => {
        let nombre = elemento.nombre_ticket.toLowerCase()
        return nombre.indexOf(
          valor.toLowerCase()) !== -1
      });

      this.setState({ tickets_usuario_resultado: array });
    } else {
      this.setState({ tickets_usuario_resultado: this.state.tickets_usuario })
    }
  }

  getTicketsUsuario() {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var data = new FormData();
    data.append('id_usuario', this.props.id_usuario);

    http._POST(Server + 'configuracion/usuario.php?accion=get_tickets_usuario', data).then((res) => {
      if (res !== 'error') {
        let resultado = [];
        for (const objecto of res) {
          resultado.push(
            {
              id_cargo: objecto.id_cargo,
              id_ticket: objecto.id_ticket,
              estado: objecto.estado,
              creacion: objecto.creacion,
              nombre_ticket: objecto.nombre_ticket,
              prioridad_recomendada: objecto.prioridad_recomendada,
              descripcion: objecto.descripcion,
              puesto: objecto.puesto,
              id_departamento: objecto.id_departamento,
              departamento: objecto.departamento,
              estado_final: JSON.parse(objecto.estado_final)
            }
          )
        }
        this.setState({ tickets_usuario: resultado, tickets_usuario_resultado: resultado });
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

class ItemTicket extends Component {

  render() {
    return (
      <Button
        onClick={() => { this.props.abrirTicket(this.props.ticket) }}
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
          width: '250px',
        }}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: '30%', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            {(this.props.ticket.estado_final.estado === 'Activo') &&
              <img src={require('../media/ticket.png')} alt="actico" width="90px" />
            }
            {(this.props.ticket.estado_final.estado === 'Inactivo') &&
              <img src={require('../media/ticket_disable.png')} alt="actico" width="90px" />
            }
          </div>
          <div style={{ width: '70%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap' }}>
              <h4>{this.props.ticket.nombre_ticket}</h4>
            </div>
            <div style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>
              {this.props.ticket.descripcion}
            </div>
            {/*<label style={{ fontSize: 10, color: '#B3B6B7' }}>{this.props.ticket.puesto} > {this.props.ticket.departamento}</label>*/}
          </div>
        </div>
        {(this.props.ticket.estado_final.estado !== 'Activo') &&
          <div style={{ display: 'flex', flex: 1, justifyContent: 'center', height: '10%', alignItems: 'flex-end', fontSize: 8 }}>
            {this.props.ticket.estado_final.motivo}
          </div>
        }
      </Button>
    )
  }
}

export default Form.create()(abrir_ticket);