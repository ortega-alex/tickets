import React, { Component } from 'react';

import Form_NuevaTicket from "./forms/nueva_ticket"
import Rodal from 'rodal';
import { Grid } from 'semantic-ui-react'
import { Icon, Divider, Form, Slider, Radio, Input, Tooltip, message, Button, Switch } from 'antd';
import http from '../services/http.services';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Search = Input.Search;

//var subiendo=false

class ver_puesto extends Component {

  constructor(props) {
    super(props);

    this.state = {
      cargando: false,
      ticket_edicion: undefined,
      modal_nuevaSub: false,
      modal_nuevaTicket: false,
      modal_visualizarTicket: false,
      sub_categoria: undefined,
      tickets: [],
      tickets_resultado: [],
      texto_busqueda: '',
      sub_categorias: [],
      frm_activo: true,
      sub_categoria_edicion: undefined,
      sub_seleccionada: undefined,
    }
  }

  componentDidMount() {
    this.getSubCategorias()
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: '10px', alignItems: 'center' }} >
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '15%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'row', }}>
              <Button
                onClick={this.solicitarEdicionCat.bind(this)}
                style={{ backgroundColor: 'transparent', border: 'none', borderColor: 'red', outline: 'none', marginRight: 5 }}
              >
                <span>
                  <Tooltip title="Editar esta Categoría" placement="left">
                    <Icon type="edit" style={{ color: '#89ADC5', fontSize: 20, marginLeft: 5 }} />
                  </Tooltip>
                </span>
              </Button>
              <span>
                Activa:&nbsp;
            <Tooltip title="Si inactivas una Categoría los usuarios no podrán hacer uso de todas sus tickets">
                  <Icon type="question-circle-o" />
                </Tooltip>
                &nbsp;
          </span>
              <Tooltip title={this.props.categoria.estado_final.directo == "No" ? ("Acción no permitida! " + this.props.categoria.estado_final.motivo) : 'Activar/Desactivar'} placement='right'>
                <div>
                  <Switch loading={this.state.cargando} defaultChecked={this.props.categoria.estado_final.estado == 'Inactivo' ? false : true} disabled={!(this.props.categoria.estado_final.directo == "No" ? false : true)} onChange={(valor) => { this.cambiarEstadoCategoria(valor) }} />
                </div>
              </Tooltip>
            </div>
            {(this.props.categoria.estado_final.motivo !== 'Activo') &&
              <div style={{ marginLeft: 43, fontSize: 10, width: '100%' }}>
                {this.props.categoria.estado_final.motivo}
              </div>
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', width: '55%', justifyContent: 'center' }}>
            {(this.state.texto_busqueda !== undefined) &&
              <Search
                style={{ width: 300, height: 33, marginLeft: 100, }}
                defaultValue={this.state.texto_busqueda}
                placeholder="Buscar Ticket"
                onSearch={value => this.bucarTicket(value)}
                enterButton
              />
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', width: '30%', justifyContent: 'flex-end', }}>
            <RadioGroup onChange={(value) => { this.cambioSubCat(value.target.value) }} value={this.state.sub_seleccionada} defaultValue={this.state.sub_seleccionada} buttonStyle="solid">
              <RadioButton value={undefined}>Todas</RadioButton>
              {this.state.sub_categorias.map((sub_categoria, i) => (
                <RadioButton key={i} value={sub_categoria.id_sub_categoria}>
                  <div style={{ color: sub_categoria.estado_final.estado == 'Activo' ? undefined : '#A6ACAF' }}>{sub_categoria.sub_categoria}</div>
                </RadioButton>
              ))}
            </RadioGroup>
            <Tooltip title="Nueva sub categoría">
              <Button onClick={this.solicito_nuevaSub.bind(this)} type="dashed" htmlType="button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
                <Icon type="plus-circle" style={{ fontSize: 16, color: "#8F8F8F" }} />
              </Button>
            </Tooltip>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, height: 45, flexDirection: 'row', width: '100%', justifyContent: 'flex-end', marginTop: 10 }}>
          {(this.state.sub_categoria_edicion) &&
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                <FormItem
                  style={{ display: 'flex', justifyContent: 'flex-end' }}
                  label={(
                    <span>
                      Activa&nbsp;
                  <Tooltip title="Si inactivas una Sub-Categoría los usuarios no podrán hacer uso de sus tickets">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                  <Tooltip title={this.state.sub_categoria_edicion.estado_final.directo == "No" ? ("Acción no permitida! " + this.state.sub_categoria_edicion.estado_final.motivo) : 'Activar/Desactivar'} placement='right'>
                    <div>
                      <Switch loading={this.state.cargando} size="small" defaultChecked={this.state.sub_categoria_edicion.estado_final.estado == "Inactivo" ? false : true} disabled={!(this.state.sub_categoria_edicion.estado_final.directo == "No" ? false : true)} onChange={(valor) => { this.cambiarEstadoSubCat(valor) }} />
                    </div>
                  </Tooltip>
                </FormItem>
                <Button
                  onClick={this.solicitarEdicionSubCat.bind(this)}
                  style={{ backgroundColor: 'transparent', border: 'none', borderColor: 'red', outline: 'none', marginTop: 10 }}
                >
                  <span>
                    <Tooltip title="Editar esta Sub-Categoría" placement="left">
                      <Icon type="edit" style={{ color: '#89ADC5', fontSize: 20, marginLeft: 5 }} />
                    </Tooltip>
                  </span>
                </Button>
              </div>
              {(this.state.sub_categoria_edicion.estado_final.motivo !== 'Activo') &&
                <div style={{ marginRight: 60, fontSize: 10, width: '100%' }}>
                  {this.state.sub_categoria_edicion.estado_final.motivo}
                </div>
              }
            </div>
          }
        </div>
        <div style={{ display: 'flex', flex: 1, height: '100%', width: '100%', paddingLeft: '20px', paddingRight: '20px' }}>
          <Grid container columns={3} padded stackable>
            <Grid.Column>
              <Button
                type="dashed"
                onClick={() => { this.solicito_nuevaTicket() }}
                style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '250px', height: '100px', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon type="plus-circle" style={{ fontSize: 35, marginTop: 10 }} />
                <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap', fontSize: 15, marginTop: 5 }}>
                  Nuevo Ticket
              </div>
              </Button>
            </Grid.Column>
            {this.state.tickets_resultado.map((ticket, i) => (
              <Grid.Column key={i}>
                <ItemTicket ticket={ticket} visualizarTicket={this.visualizarTicket.bind(this)} />
              </Grid.Column>
            ))}
          </Grid>
        </div>
        {this.modalVisualizarTicket()}
        {this.modalNuevaSub()}
        {this.modalNuevaTicket()}
      </div>
    );
  }

  solicitarEdicionCat() {
    this.props.solicitarEdicionCat(this.props.categoria)
  }

  solicitarEdicionSubCat() {
    if (this.state.sub_categoria_edicion.estado == 1) {
      this.setState({ frm_activo: true })
    } else {
      this.setState({ frm_activo: false })
    }
    this.setState({ modal_nuevaSub: true })
  }

  bucarTicket(valor) {
    if (valor != "") {
      let array = this.state.tickets
      array = array.filter((elemento) => {
        let nombre = elemento.nombre_ticket.toLowerCase()
        return nombre.indexOf(
          valor.toLowerCase()) !== -1
      })
      this.setState({ tickets_resultado: array })
    } else {
      this.setState({ tickets_resultado: this.state.tickets })
    }
  }

  cambiarEstadoCategoria(estado) {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var cambiar_a = (!estado) ? 0 : 1;

    var data = new FormData();
    data.append('id_categoria', this.props.id_categoria);
    data.append('estado', cambiar_a);

    http._POST(Server + 'configuracion/ticket.php?accion=estado_cat', data).then(res => {
      if (res !== 'error') {
        this.setState({ cargando: false });
        this.props.getCategorias();
      } else {
        message.error("Error al actualizar categoría.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al actualizar categoría." + err);
      this.setState({ cargando: false });
    });
  }


  cambiarEstadoSubCat(estado) {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var cambiar_a = (!estado) ? 0 : 1;

    var data = new FormData();
    data.append('id_sub_categoria', this.state.sub_categoria_edicion.id_sub_categoria);
    data.append('estado', cambiar_a);

    http._POST(Server + 'configuracion/ticket.php?accion=estado_sub_cat', data).then(res => {
      if (res !== 'error') {
        this.setState({ cargando: false });
        this.getSubCategorias();
      } else {
        message.error("Error al actualizar sub categoría.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al actualizar sub categoría." + err);
      this.setState({ cargando: false });
    });
  }

  solicito_nuevaSub() {
    this.setState({ modal_nuevaSub: !this.state.modal_nuevaSub });
  }

  cambioSubCat(sub) {
    this.setState({ sub_seleccionada: sub });
    this.setState({ sub_categoria: sub, tickets: [] }, () => {
      this.getTickets();
    });

    this.setState({ texto_busqueda: undefined }, () => {
      this.setState({ texto_busqueda: '' });
    });

    this.setState({ sub_categoria_edicion: undefined }, () => {

      for (const objeto of this.state.sub_categorias) {
        if (objeto.id_sub_categoria == sub) {
          this.setState({ sub_categoria_edicion: objeto });
        }
      }

    });
  }

  modalNuevaTicket() {
    return (
      <Rodal
        animation={'flip'}
        visible={this.state.modal_nuevaTicket}
        height={635}
        width={500}
        onClose={() => { this.setState({ modal_nuevaTicket: !this.state.modal_nuevaTicket }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(this.state.modal_nuevaTicket) &&
          <Form_NuevaTicket ticket_edicion={this.state.ticket_edicion} closeModalNuevaTicket={this.closeModalNuevaTicket.bind(this)} categorias={this.props.categorias} sub_categorias={this.state.sub_categorias} Server={this.props.Server} id_categoria={this.props.id_categoria} sub_categoria={this.state.sub_categoria} />
        }
      </Rodal>
    )
  }

  solicito_nuevaTicket() {
    this.setState({ ticket_edicion: undefined }, () => {
      this.setState({ modal_nuevaTicket: !this.state.modal_nuevaTicket });
    });
  }

  closeModalNuevaTicket() {
    this.setState({ modal_nuevaTicket: !this.state.modal_nuevaTicket });
    this.getTickets();
  }

  modalNuevaSub() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Rodal
        animation={'flip'}
        visible={this.state.modal_nuevaSub}
        height={330}
        onClose={() => { this.setState({ modal_nuevaSub: !this.state.modal_nuevaSub }) }}
        closeOnEsc closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(this.state.modal_nuevaSub) &&
          <Form onSubmit={this.crearSubCategoria.bind(this)} style={{ height: "100%" }}>
            <div style={{ height: "90%" }}>
              {(this.state.sub_categoria_edicion == undefined) && <h2 style={{ textAlign: 'center' }}>Nueva Sub Categoría</h2>}
              {(this.state.sub_categoria_edicion != undefined) && <h2 style={{ textAlign: 'center' }}>Edición Sub Categoría</h2>}
              <Divider style={{ margin: '0px' }} />
              <FormItem label="Nombre:">
                {getFieldDecorator('nombre_sub_categoria', { initialValue: (this.state.sub_categoria_edicion != undefined ? this.state.sub_categoria_edicion.sub_categoria : ''), rules: [{ required: true, message: 'Por favor indica un nombre!' }] })(
                  <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Nombre de la sub categoría" />
                )}
              </FormItem>
              <div style={{ display: 'flex', flexDirection: 'row', padding: "10px" }}>
                <FormItem
                  style={{ display: 'flex', flex: 1 }}
                  label={(
                    <span>
                      Activa&nbsp;
                        <Tooltip title="Si inactivas una Sub-Categoría, los usuarios no podrán crear las tickets pertenecientes a ésta.">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                  {getFieldDecorator('activo', { rules: [{ required: false, }] })(
                    <Switch defaultChecked={this.state.frm_activo} onChange={(valor) => { this.setState({ frm_activo: valor }) }} />
                  )}
                </FormItem>
              </div>
            </div>
            <div style={{ display: 'flex', height: "10%", justifyContent: 'center' }}>
              <Button disabled={this.state.cargando} type="primary" htmlType="submit" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                {(!this.state.sub_categoria_edicion) && <div>Crear</div>}
                {(this.state.sub_categoria_edicion) && <div>Guardar Cambios</div>}
              </Button>
            </div>
          </Form>
        }
      </Rodal>
    )
  }

  crearSubCategoria(e) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {

        this.setState({ cargando: true });
        let Server = String(this.props.Server);

        var data = new FormData();
        data.append('nombre_categoria', values.nombre_sub_categoria);
        data.append('estado', this.state.frm_activo ? '1' : '0');
        data.append('id_categoria', this.props.id_categoria);

        if (!this.state.sub_categoria_edicion) {
          http._POST(Server + 'configuracion/ticket.php?accion=nueva_sub_categoria', data).then(res => {
            if (res !== 'error') {
              this.setState({ modal_nuevaSub: false });
              this.setState({ sub_seleccionada: res });
              message.success("Sub Categoría creada correctamente.");
              this.setState({ cargando: false });
              this.getSubCategorias();
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false });
            }
          }).catch(err => {
            message.error("Ha ocurrido un error." + err);
            this.setState({ cargando: false });
          });
        } else {

          data.append('id_sub_categoria', this.state.sub_categoria_edicion.id_sub_categoria);
          http._POST(Server + 'configuracion/ticket.php?accion=edit_sub_categoria', data).then(res => {
            if (res !== 'error') {
              this.setState({ modal_nuevaSub: false });
              message.success("Sub Categoría actualizada correctamente.");
              this.setState({ cargando: false });
              this.getSubCategorias();
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false })
            }
          }).catch(err => {
            message.error("Ha ocurrido un error." + err);
            this.setState({ cargando: false });
          });
        }
      }
    });
  }

  getSubCategorias() {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var data = new FormData();
    data.append('id_categoria', this.props.id_categoria);

    http._POST(Server + 'configuracion/ticket.php?accion=get_sub_categorias', data).then(res => {
      if (res !== 'error') {
        let resultado = [];
        for (const objecto of res) {
          resultado.push(
            {
              id_sub_categoria: objecto.id_sub_categoria,
              sub_categoria: objecto.sub_categoria,
              id_categoria: objecto.id_categoria,
              estado: objecto.estado,
              creacion: objecto.creacion,
              estado_final: JSON.parse(objecto.estado_final)
            }
          )
        }
        this.setState({ sub_categorias: resultado });
        this.setState({ cargando: false });
        this.getTickets();
      } else {
        message.error("Error al cargar Sub Categorías.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Sub Categorías." + err);
      this.setState({ cargando: false });
    });
  }

  getTickets() {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var data = new FormData();
    data.append('id_categoria', this.props.id_categoria ? this.props.id_categoria : 0);
    data.append('sub_categoria', this.state.sub_categoria != 0 ? this.state.sub_categoria : 0);

    http._POST(Server + 'configuracion/ticket.php?accion=get_tickets', data).then(res => {
      if (res !== 'error') {
        let resultado = [];
        for (const objecto of res) {
          resultado.push(
            {
              id_ticket: objecto.id_ticket,
              nombre_ticket: objecto.nombre_ticket,
              descripcion: objecto.descripcion,
              id_sub_categoria: objecto.id_sub_categoria,
              tiempo_estimado: objecto.tiempo_estimado,
              prioridad_recomendada: objecto.prioridad_recomendada,
              estado: objecto.estado,
              creacion: objecto.creacion,
              procedimiento: objecto.procedimiento,
              estado_final: JSON.parse(objecto.estado_final),
            }
          )
        }
        this.setState({ tickets: resultado });
        this.setState({ tickets_resultado: resultado });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Tickets.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Tickets." + err);
      this.setState({ cargando: false })
    });
  }

  visualizarTicket(ticket) {
    this.cargarTicket(ticket.id_ticket)
  }

  cargarTicket(ticket) {
    let Server = String(this.props.Server)

    this.setState({ cargando: true })

    var data = new FormData();
    data.append('id_ticket', ticket);

    http._POST(Server + 'configuracion/ticket.php?accion=get_ticket', data).then(res => {
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
        this.setState({ ticket_edicion: undefined }, () => {
          this.setState({ ticket_edicion: resultado, modal_visualizarTicket: true });
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

  modalVisualizarTicket() {

    const { getFieldDecorator } = this.props.form;
    return (
      <Rodal
        animation={'flip'}
        visible={this.state.modal_visualizarTicket}
        height={450}
        width={720}
        onClose={() => { this.setState({ modal_visualizarTicket: !this.state.modal_visualizarTicket }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(this.state.ticket_edicion) &&
          <div style={{ width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '20%', justifyContent: 'center', }}>
              <div style={{ display: 'flex', flexDirection: 'row', textAlign: 'center', alignItems: 'center', justifyContent: 'center', whiteSpace: 'pre-wrap', lineHeight: 0 }}>
                <Button
                  onClick={this.solicitarEdicionTicket.bind(this)}
                  style={{ backgroundColor: 'transparent', border: 'none', borderColor: 'red', outline: 'none' }}
                >
                  <span>
                    <Tooltip title="Editar Ticket">
                      <Icon type="edit" style={{ color: '#3498DB', fontSize: 25, paddingRight: 10 }} />
                    </Tooltip>
                  </span>
                </Button>
                <div style={{ display: 'flex', flex: 1, marginRight: -30, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  {(this.state.ticket_edicion != undefined) && <h2 style={{ textAlign: 'center' }}>{this.state.ticket_edicion.nombre_ticket}</h2>}
                  {(this.state.ticket_edicion != undefined) && <div style={{ textAlign: 'center' }}>{this.state.ticket_edicion.categoria.categoria}>{this.state.ticket_edicion.sub_categoria.sub_categoria}</div>}
                </div>
                <FormItem
                  style={{ display: 'flex', justifyContent: 'flex-end', marginRight: 30, marginTop: 30, color: 'red' }}
                  label={(
                    <span>
                      Activa&nbsp;
                        <Tooltip title="Si inactivas una ticket los usuarios no podrán hacer uso de ella">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                  {getFieldDecorator('activo', { rules: [{ required: false, }] })(
                    <Switch loading={this.state.cargando} defaultChecked={this.state.ticket_edicion.estado == 1 ? true : false} onChange={(valor) => { this.cambiarEstadoTicket(valor) }} />
                  )}
                </FormItem>
              </div>
              <Divider />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '80%' }}>
              <div style={{ display: 'flex', flex: 1, paddingRight: '10px', flexDirection: 'column', width: '50%', height: '100%', whiteSpace: 'pre-wrap' }}>
                <label style={{ width: '100%', marginBottom: 10, marginTop: 10 }}>
                  <h4>Tiempo Estimado:</h4>
                  <div style={{ width: '100%', textAlign: 'center', fontSize: 20, color: '#2980B9' }}>{this.state.ticket_edicion.tiempo_estimado} minutos</div>
                </label>
                <label style={{ width: '100%', marginBottom: 50 }}>
                  <h4>Descripción:</h4>
                  <div style={{ width: '100%', fontSize: 15 }}>{this.state.ticket_edicion.descripcion}</div>
                </label>
                <label style={{ width: '100%', marginBottom: 10, textAlign: 'center' }}>
                  <h4>Prioridad</h4>
                  <div style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                    <Slider disabled style={{ fontSize: 7, }} marks={{ 1: 'Muy baja', 2: 'Baja', 3: 'Media', 4: 'Alta', 5: 'Muy alta' }} min={1} max={5} onChange={(valor) => { }} defaultValue={parseInt(this.state.ticket_edicion.prioridad_recomendada)} />
                  </div>
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '50%', height: '95%', whiteSpace: 'pre-wrap' }}>
                <div style={{ width: '97%', height: '100%', padding: '20px', backgroundColor: '#F5F5F5', borderRadius: 7 }}>
                  <h4 style={{ width: '100%', textAlign: 'center' }}>Procedimiento</h4>
                  {(this.state.ticket_edicion.procedimiento) &&
                    <div>{this.state.ticket_edicion.procedimiento}</div>
                  }
                  {(!this.state.ticket_edicion.procedimiento) &&
                    <div>Sin procedimiento especificado.</div>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </Rodal>
    )
  }

  cambiarEstadoTicket(estado) {

    let Server = String(this.props.Server)
    this.setState({ cargando: true })
    var cambiar_a = (!estado) ? 0 : 1;

    var data = new FormData();
    data.append('id_ticket', this.state.ticket_edicion.id_ticket);
    data.append('estado', cambiar_a);

    http._POST(Server + 'configuracion/ticket.php?accion=estado', data).then(res => {
      if (res !== 'error') {
        this.setState({ cargando: false });
        this.cargarTicket(this.state.ticket_edicion.id_ticket);
        this.getTickets();
      } else {
        message.error("Error al actualizar estado.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al actualizar estado." + err);
      this.setState({ cargando: false })
    });
  }

  solicitarEdicionTicket() {
    this.setState({ sub_categoria: this.state.ticket_edicion.id_sub_categoria, modal_nuevaTicket: true })
  }
}


class ItemTicket extends Component {

  render() {
    return (
      <Button
        onClick={() => { this.props.visualizarTicket(this.props.ticket) }}
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
            {(this.props.ticket.estado_final.estado == 'Activo') &&
              <Icon type="tool" style={{ color: '#5DADE2', fontSize: 40, textAlign: 'center' }} />
            }
            {(this.props.ticket.estado_final.estado == 'Inactivo') &&
              <Icon type="tool" style={{ color: '#D0D3D4', fontSize: 40, textAlign: 'center' }} />
            }
          </div>
          <div style={{ width: '70%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap' }}>
              <h4>{this.props.ticket.nombre_ticket}</h4>
            </div>
            <div style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>
              {this.props.ticket.descripcion}
            </div>
          </div>
        </div>
        {(this.props.ticket.estado_final.estado !== 'Activo') &&
          <div style={{ display: 'flex', flex: 1, justifyContent: 'center', height: '40%', alignItems: 'flex-end', fontSize: 8, marginTop: 10 }}>
            {this.props.ticket.estado_final.motivo}
          </div>
        }
      </Button>
    )
  }
}

export default Form.create()(ver_puesto);