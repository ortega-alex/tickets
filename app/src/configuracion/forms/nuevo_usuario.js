import React, { Component } from 'react';

import { Form, Icon, Divider, Input, Tooltip, message, Button, Switch } from 'antd';
import http from '../../services/http.services';

const FormItem = Form.Item;

class nuevo_usuario extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nuevo_usuario_activo: true,
    }
  }

  componentWillMount() {
    if (this.props.usuario_edicion !== undefined) {
      this.setState({ nuevo_usuario_activo: this.props.usuario_edicion.estado == 1 ? true : false });
    }
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
        <Form ref={ref => this.formulariote = ref} onSubmit={this.crearUsuario.bind(this)} style={{ height: "100%" }}>
          <div style={{ height: "90%" }}>
            <h2 style={{ textAlign: 'center' }}>
              {(!this.props.usuario_edicion) && <div>Nuevo Usuario</div>}
              {(this.props.usuario_edicion) && <div>Edición de Usuario</div>}
            </h2>
            <Divider style={{ margin: '0px', marginBottom: 20 }} />
            <FormItem label="Nombre:"
              {...formItemLayout}>
              {getFieldDecorator('nombre_completo', { rules: [{ required: true, message: 'Por favor indica el nombre del usuario.' }], initialValue: (this.props.usuario_edicion ? String(this.props.usuario_edicion.nombre_completo) : undefined) })(
                <Input prefix={<Icon type="solution" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Nombre completo" />
              )}
            </FormItem>
            <FormItem label="Email:"
              {...formItemLayout}>
              {getFieldDecorator('email', { rules: [{ required: true, type: 'email', message: 'Por favor indica un email válido.' }], initialValue: (this.props.usuario_edicion ? String(this.props.usuario_edicion.email) : undefined) })(
                <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
              )}
            </FormItem>
            <FormItem label="Username:"
              {...formItemLayout}>
              {getFieldDecorator('username', { rules: [{ required: true, message: 'Por favor indica un Username.' }], initialValue: (this.props.usuario_edicion ? String(this.props.usuario_edicion.username) : undefined) })(
                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
              )}
            </FormItem>
            <FormItem label="Contraseña:"
              {...formItemLayout}>
              {getFieldDecorator('pass', { rules: [{ required: true, message: 'Por favor indica una contraseña.' }, { validator: this.validateToNextPassword }], initialValue: (this.props.usuario_edicion ? String(this.props.usuario_edicion.password) : undefined) })(
                <Input type="password" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Contraseña" />
              )}
            </FormItem>
            <FormItem label="Confirmar contr."
              {...formItemLayout}>
              {getFieldDecorator('pass_confirm', { rules: [{ required: true, message: 'Por favor confirma tu contraseña.' }, { validator: this.compareToFirstPassword }], initialValue: (this.props.usuario_edicion ? String(this.props.usuario_edicion.password) : undefined) })(
                <Input type="password" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Confirma Contraseña" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              style={{ display: 'flex', flex: 1 }}
              label={(
                <span>
                  Activo&nbsp;
                  <Tooltip title="Si inactivas un usuario este no podrá crear tickets.">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )}
            >
              {getFieldDecorator('activo', { rules: [{ required: false, message: "hola" }] })(
                <Switch defaultChecked={this.state.nuevo_usuario_activo} onChange={(valor) => { this.setState({ nuevo_usuario_activo: valor }) }} />
              )}
            </FormItem>
          </div>
          <div style={{ display: 'flex', height: "10%", justifyContent: 'center' }}>
            <Button disabled={this.state.cargando} type="primary" htmlType="submit" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              {(!this.props.usuario_edicion) && <div>Crear Usuario</div>}
              {(this.props.usuario_edicion) && <div>Guardar Cambios</div>}
            </Button>
          </div>
        </Form>
      </div>
    )
  }

  crearUsuario(e) {

    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {

        this.setState({ cargando: true })
        let Server = String(this.props.Server)

        var data = new FormData();
        data.append('nombre_completo', values.nombre_completo);
        data.append('username', values.username);
        data.append('pass', values.pass);
        data.append('email', values.email);
        data.append('pass_confirm', values.pass_confirm);
        data.append('activo', this.state.nuevo_usuario_activo ? '1' : '0');

        if (!this.props.usuario_edicion) {
          http._POST(Server + 'configuracion/usuario.php?accion=nuevo', data).then((res) => {
            if (res !== 'error') {
              if (res !== 'existe') {
                this.props.closeModalNuevoUsuario(res);
                message.success("Usuario creado correctamente.");
                this.setState({ cargando: false });
              } else {
                message.warn("Usuario ya existe");
                this.setState({ cargando: false });
              }
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false });
            }
          }).catch(err => {
            message.error("Ha ocurrido un error." + err);
            this.setState({ cargando: false });
          });
        } else {
          data.append('id_usuario', this.props.usuario_edicion.id_usuario);
          http._POST(Server + 'configuracion/usuario.php?accion=edit', data).then((res) => {
            if (res != 'error') {
              this.props.closeModalNuevoUsuario(res);
              message.success("Usuario actualizado correctamente.");
              this.setState({ cargando: false });
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false });
            }
          }).catch(err => {
            message.error("Ha ocurrido un error catch." + err);
            this.setState({ cargando: false });
          });
        }
      }
    });

  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['pass'], { force: true });
    }
    callback();
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('pass_confirm')) {
      callback('Las contraseñas no coinciden!');
    } else {
      callback();
    }
  }
}

export default Form.create()(nuevo_usuario);