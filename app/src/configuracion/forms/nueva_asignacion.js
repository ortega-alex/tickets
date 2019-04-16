import React, { Component } from 'react';

import { Icon, Divider, Form, Tooltip, message, Select, Button, Switch } from 'antd';
import http from '../../services/http.services';

const FormItem = Form.Item;
const Option = Select.Option;

class nueva_asignacion extends Component {

  constructor(props) {
    super(props);

    this.state = {
      departamentos: [],
      puestos: [],
      usuarios: [],
      check_asignacion_activa: true,
      nuevo_actualizar_permisos: true,
    }
  }

  componentDidMount() {
    this.getPuestos();
    this.getDepartamentos();
    this.getUsuarios();
  }

  render() {

    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }} >
        <Form className="form_asignacion" key="hop0" onSubmit={this.crearAsignacion.bind(this)} style={{ height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '80%', }}>
            <Divider style={{ margin: '0px' }} />
            <div style={{ marginTop: 10 }}>
              <FormItem
                {...formItemLayout}
                label="Dpto."
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
                {getFieldDecorator('departamento', {
                  rules: [{ required: true, message: 'Por favor selecciona un departamento!' }], initialValue: (this.props.id_departamento ? String(this.props.id_departamento) : undefined)
                })(
                  <Select
                    showSearch
                    autoClearSearchValue
                    style={{ width: 280 }}
                    placeholder="Selecciona un Departamento"
                    optionFilterProp="children"
                    onChange={(seleccion) => { this.setState({ asignacion_departamento: seleccion }) }}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {this.state.departamentos.map((departamento) => (
                      <Option value={departamento.id_departamento}>{String(departamento.departamento)}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </div>

            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'row' }}>
              <FormItem
                {...formItemLayout}
                label="Usuario"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
                {getFieldDecorator('usuario', {
                  rules: [{ required: true, message: 'Por favor selecciona un usuario!' }], initialValue: (this.props.id_usuario ? String(this.props.id_usuario) : undefined)
                })(
                  <Select
                    showSearch
                    autoClearSearchValue
                    style={{ width: 280 }}
                    placeholder="Selecciona un Usuario"
                    optionFilterProp="children"
                    onChange={(seleccion) => { this.setState({ asignacion_usuario: seleccion }) }}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {this.state.usuarios.map((usuario) => (
                      <Option value={usuario.id_usuario}>{String(usuario.nombre_completo) + " @" + String(usuario.username)}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </div>

            <div style={{ marginTop: 10 }}>
              <FormItem
                {...formItemLayout}
                label="Puesto"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 12 }}
              >
                {getFieldDecorator('puesto', {
                  rules: [{ required: true, message: 'Por favor selecciona un puesto!' }],
                })(
                  <Select
                    showSearch
                    autoClearSearchValue
                    style={{ width: 280 }}
                    placeholder="Selecciona un Puesto"
                    optionFilterProp="children"
                    onChange={(seleccion) => { this.setState({ asignacion_puesto: seleccion }) }}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {this.state.puestos.map((puesto) => (
                      <Option value={puesto.id_puesto}>{puesto.puesto}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </div>

            <div style={{ display: 'flex', flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <FormItem
                style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}
                label={(
                  <span>
                    Activo&nbsp;
                  <Tooltip title="Puedes inactivar el puesto asignado de un usuario.">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
              >
                {getFieldDecorator('activo', { rules: [{ required: false, message: "hola" }] })(
                  <Switch defaultChecked={this.state.check_asignacion_activa} onChange={(valor) => { this.setState({ check_asignacion_activa: valor }) }} />
                )}
              </FormItem>

              <FormItem
                style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}
                label={(
                  <span>
                    Aplicar Perfil&nbsp;
                  <Tooltip title="Se aplicará perfil de tickets correspondiente a este puesto.">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
              >
                {getFieldDecorator('nuevo_actualizar_permisos', { rules: [{ required: false }] })(
                  <Switch defaultChecked={this.state.nuevo_actualizar_permisos} onChange={(valor) => { this.setState({ nuevo_actualizar_permisos: valor }) }} />
                )}
              </FormItem>
            </div>
          </div>

          <div style={{ display: 'flex', height: "10%", width: '100%', justifyContent: 'center' }}>
            <Button disabled={this.state.cargando} type="primary" htmlType="submit" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              Crear Asignación
          </Button>
          </div>
        </Form>
      </div>
    )
  }

  crearAsignacion(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ cargando: true });
        let Server = String(this.props.Server);

        var estado = (this.state.check_asignacion_activa) ? '1' : '0';
        var nuevo_actualizar_permisos = (this.state.nuevo_actualizar_permisos) ? '1' : '0';

        var data = new FormData();
        data.append('usuario', values.usuario);
        data.append('puesto', values.puesto);
        data.append('activo', estado);
        data.append('departamento', values.departamento);
        data.append('nuevo_actualizar_permisos', nuevo_actualizar_permisos);

        http._POST(Server + 'configuracion/usuario.php?accion=asignar', data).then((res) => {
          if (res !== 'error') {
            if (res !== 'existe') {
              this.props.closeModalAsignacion(res);
              message.success("Usuario asignado correctamente.");
              this.props.getDepartamentos();
              this.setState({ cargando: false });
            } else {
              message.warn("Asignación ya existe");
              this.setState({ cargando: false });
            }
          } else {
            message.error("Ha ocurrido un error.");
            this.setState({ cargando: false });
          }
        }).catch(err => {
          message.error("Ha ocurrido un error." + err);
          this.setState({ cargando: false })
        });
      }
    });
  }

  getPuestos() {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    http._GET(Server + 'configuracion/puesto.php?accion=get').then((res) => {
      if (res !== 'error') {
        this.setState({ puestos: res });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Departamentos.");
        this.setState({ cargando: false })
      }
    }).catch(err => {
      message.error("Error al cargar Departamentos." + err);
      this.setState({ cargando: false });
    });
  }

  getDepartamentos() {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    http._GET(Server + 'configuracion/departamento.php?accion=get').then((res) => {
      if (res !== 'error') {
        this.setState({ departamentos: res });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Departamentos.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Departamentos." + err);
      this.setState({ cargando: false })
    });
  }

  getUsuarios() {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    http._GET(Server + 'configuracion/usuario.php?accion=get').then((res) => {
      if (res !== 'error') {
        this.setState({ usuarios: res });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Usuarios.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Usuarios." + err);
      this.setState({ cargando: false });
    });
  }
}

export default Form.create()(nueva_asignacion);