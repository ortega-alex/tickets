import React, { Component } from 'react';

import CategoriaView from "../configuracion/ticket_categoria"
import Rodal from 'rodal';
import { Icon, Divider, Form, Tabs, Input, Tooltip, message, Button, Switch } from 'antd';
import http from '../services/http.services';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

class ver_puesto extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cargando: false,
      categoria_edicion: undefined,
      modal_nuevaCategoria: false,
      frm_activo: true,
      categorias: [],
    }
  }

  componentDidMount() {
    this.getCategorias()
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: '10px' }} >
        {this.modalNuevaCategoria()}
        <Tabs onChange={() => { }} type="card"
          tabBarExtraContent={
            <div>
              <Button onClick={this.solicito_nuevaCategoria.bind(this)} type="primary" htmlType="button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Icon type="plus-circle" style={{ color: 'white', fontSize: 13 }} /> Nueva Categoría
              </Button>
            </div>
          }
        >
          {this.state.categorias.map((categoria) => (
            <TabPane key={categoria.id_categoria}
              tab={
                <div style={{ color: categoria.estado_final.estado === 'Activo' ? undefined : '#A6ACAF' }}>{categoria.categoria}</div>
              }
            >
              {(!this.state.cargando) &&
                <CategoriaView _usuario={this.props._usuario} solicitarEdicionCat={this.solicitarEdicionCat.bind(this)} categoria={categoria} getCategorias={this.getCategorias.bind(this)} Server={this.props.Server} id_categoria={categoria.id_categoria} categorias={this.state.categorias} />
              }
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  }

  solicito_nuevaCategoria() {
    this.setState({ categoria_edicion: undefined, frm_activo: true }, () => {
      this.setState({ modal_nuevaCategoria: !this.state.modal_nuevaCategoria });
    })
  }

  solicitarEdicionCat(categoria) {
    if (categoria.estado == 1) {
      this.setState({ frm_activo: true });
    } else {
      this.setState({ frm_activo: false });
    }
    this.setState({ categoria_edicion: categoria }, () => {
      this.setState({ modal_nuevaCategoria: true });
    });
  }

  modalNuevaCategoria() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Rodal
        animation={'flip'}
        visible={this.state.modal_nuevaCategoria}
        height={330}
        onClose={() => { this.setState({ modal_nuevaCategoria: !this.state.modal_nuevaCategoria }) }}
        closeOnEsc closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(this.state.modal_nuevaCategoria) &&
          <Form onSubmit={this.crearCategoria.bind(this)} style={{ height: "100%" }}>
            <div style={{ height: "90%" }}>
              {(this.state.categoria_edicion == undefined) && <h2 style={{ textAlign: 'center' }}>Nueva Categoría</h2>}
              {(this.state.categoria_edicion != undefined) && <h2 style={{ textAlign: 'center' }}>Edición Categoría</h2>}
              <Divider style={{ margin: '0px' }} />
              <FormItem label="Nombre:">
                {getFieldDecorator('nombre_categoria', { initialValue: (this.state.categoria_edicion != undefined ? this.state.categoria_edicion.categoria : ''), rules: [{ required: true, message: 'Por favor indica un nombre!' }] })(
                  <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Nombre de la categoría" />
                )}
              </FormItem>
              <div style={{ display: 'flex', flexDirection: 'row', padding: "10px" }}>
                <FormItem
                  style={{ display: 'flex', flex: 1 }}
                  label={(
                    <span>
                      Activo&nbsp;
                        <Tooltip title="Si inactivas una categoría, los usuarios no podrán crear las tickets pertenecientes a la categoría.">
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
                {(!this.state.categoria_edicion) && <div>Crear</div>}
                {(this.state.categoria_edicion) && <div>Guardar Cambios</div>}
              </Button>
            </div>
          </Form>
        }
      </Rodal>
    )
  }

  crearCategoria(e) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ cargando: true });
        let Server = String(this.props.Server);

        var data = new FormData();
        data.append('nombre_categoria', values.nombre_categoria);
        data.append('estado', this.state.frm_activo ? '1' : '0');
        data.append('_usuario' , this.props._usuario); 

        if (!this.state.categoria_edicion) {
          http._POST(Server + 'configuracion/ticket.php?accion=nueva_categoria', data).then(res => {
            if (res !== 'error') {
              this.setState({ modal_nuevaCategoria: false });
              message.success("Categoría creada correctamente.");
              this.setState({ cargando: false });
              this.getCategorias();
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false });
            }
          }).catch(err => {
            message.error("Ha ocurrido un error.");
            this.setState({ cargando: false });
          });
        } else {
          data.append('id_categoria', this.state.categoria_edicion.id_categoria);
          http._POST(Server + 'configuracion/ticket.php?accion=edit_categoria', data).then(res => {
            if (res !== 'error') {
              this.setState({ modal_nuevaCategoria: false });
              message.info("Categoría actualizada correctamente.");
              this.setState({ cargando: false });
              this.getCategorias();
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
    });
  }

  getCategorias() {
    let Server = String(this.props.Server)
    this.setState({ cargando: true });

    http._GET(Server + 'configuracion/ticket.php?accion=get_categorias').then(res => {
      if (res !== 'error') {
        let resultado = [];
        for (const objecto of res) {
          resultado.push(
            {
              id_categoria: objecto.id_categoria,
              categoria: objecto.categoria,
              estado: objecto.estado,
              creacion: objecto.creacion,
              estado_final: JSON.parse(objecto.estado_final)
            }
          )
        }
        this.setState({ categorias: resultado });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Categorías.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Categorías." + err);
      this.setState({ cargando: false });
    });
  }
}

export default Form.create()(ver_puesto);