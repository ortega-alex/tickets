import React, { Component } from 'react';
import { Icon, Form, Input, message, Button } from 'antd';

import http from '../services/http.services';
import './login.component.css';

const FormItem = Form.Item;

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="login-view">
                <Form ref={ref => this.formulariote = ref} onSubmit={this.acceder.bind(this)}>
                    <FormItem
                        className="form-item"
                    >
                        {getFieldDecorator('username', { rules: [{ required: true, message: 'Por favor indica un nombre de usuario.' }], })(
                            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
                        )}
                    </FormItem>
                    <FormItem
                        className="form-item"
                    >
                        {getFieldDecorator('pass', { rules: [{ required: true, message: 'Por favor indica tu contraseña.' }, { validator: this.validateToNextPassword }], })(
                            <Input type="password" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Contraseña" />
                        )}
                    </FormItem>
                    <div style={{ display: 'flex', height: '25%', justifyContent: 'center' }}>
                        <Button disabled={this.state.cargando} type="primary" htmlType="submit" className="btn-item">
                            Acceder
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }

    acceder(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ cargando: true })
                var data = new FormData();
                let Server = String(this.props.Server);
                data.append('username', values.username);
                data.append('password', values.pass);

                http._POST(Server + 'acceso/iniciarsession.php', data).then(res => {
                    if (res === 'BadUsuario') {
                        message.warn("Usuario no existe");
                    } else if (res === 'BadPassword') {
                        message.warn("Contraseña Incorrecta");
                    } else if (res) {
                        this.props.levantamosSesion(res)
                    }
                    this.setState({ cargando: false });
                }).catch(err => {
                    message.error("Ha ocurrido un error: " + err);
                    this.setState({ cargando: false });
                });
            }
        });
    }
}

export default Form.create()(Login);