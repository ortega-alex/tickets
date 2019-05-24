import React, { Component } from 'react';

//import { Grid } from 'semantic-ui-react'
import { Icon, DatePicker, Form, Input, Tooltip, message, Select, Button, Switch, Upload } from 'antd';
import http from '../services/http.services';

var moment = require('moment');
require("moment/min/locales.min");
moment.locale('es');
var subiendo = false;

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
//const Search = Input.Search;


class NuevoTicket extends Component {

    constructor(props) {
        super(props);
        this.state = {
            categorias: [],
            tickets: [],
            ticket: null,
            frm_programada: false,
            frm_tercero: false,
            departamentos_usuario: [],
            empleados_departamento: [],
            frm_empleado: null,
            frm_departamento: null,
            files: FileList,
            inf_adicional: '' ,
            date : moment()
        };
        console.log(this.props);
    }

    componentDidMount() {
        this.getCategoria();
        this.getDepartamentosUsuario();
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const propsUpload = {
            disabled: subiendo,
            className: "upload-list-inline",
            onRemove: this.borrarAdjunto.bind(this),
            onChange: this.onChange,
            multiple: true,
            listType: "picture",
            customRequest: this.subirAdjunto.bind(this)
        };
        return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%' }} >
                <h3 style={{ padding: '1% 0% 0% 1%' }}>Seleccione la categoria del ticket segun su inconveniente.</h3>
                <div style={{ display: 'flex', flex: 0, flexDirection: 'row', width: "100%", justifyContent: 'center' }}>
                    <FormItem
                        label="Categoria"
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 12 }}
                    >
                        {getFieldDecorator('categoria', {
                            rules: [{ required: true, message: 'Por favor selecciona un categoria!' }], initialValue: (undefined)
                        })(
                            <Select
                                showSearch
                                autoClearSearchValue
                                style={{ width: 280 }}
                                placeholder="Selecciona un categoria"
                                optionFilterProp="children"
                                onChange={(seleccion) => { this.setState({ ticket: null, tickets: [] }); this.getTicketsCategoria(seleccion) }}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.state.categorias.map((item, i) => (
                                    <Option key={i} value={item.id_categiria}>{item.categoria}</Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem
                        label="Tickets"
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 12 }}
                    >
                        {getFieldDecorator('tickets', {
                            rules: [{ required: true, message: 'Por favor selecciona un Tickets!' }], initialValue: (undefined)
                        })(
                            <Select
                                showSearch
                                autoClearSearchValue
                                style={{ width: 280 }}
                                placeholder="Selecciona un Tickets"
                                optionFilterProp="children"
                                onChange={(seleccion) => { this.setState({ ticket: null }); this.cargarTicket(seleccion) }}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.state.tickets.map((item, i) => (
                                    <Option key={i} value={item.id_ticket}>{item.nombre_ticket}</Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                </div>
                <div >
                    {(this.state.ticket != undefined) &&
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: "100%", justifyContent: 'center' }}>
                            <div style={{ display: 'flex', width: '50%', padding: '20px', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'justify', whiteSpace: 'pre-wrap', backgroundColor: '#ECF0F1', borderRadius: 7, margin: '1%' }}>
                                <b>Descripcion del ticket: </b>{this.state.ticket.descripcion}
                            </div>
                            <div style={{ display: 'flex', width: '50%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '1%' }}>
                                <TextArea rows={4} onChange={this.mesdnsajeInformacionAdicional.bind(this)} placeholder="Si deseas proporciona información adicional del problema." />
                            </div>
                        </div>
                    }

                    {(this.state.ticket != undefined) &&
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: "100%", justifyContent: 'center' }}>
                            <FormItem
                                style={{ display: 'flex', width: '50%', flexDirection: 'row', justifyContent: 'center' }}
                                label={(
                                    <span>
                                        Para un tercero&nbsp;
                                        <Tooltip title="El ticket quedara registrado con el usuario que seleccione.">
                                            <Icon type="question-circle-o" />
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                {getFieldDecorator('tercero', { rules: [{ required: false, }] })(
                                    <Switch defaultChecked={this.state.frm_tercero} onChange={(valor) => { this.setState({ frm_tercero: valor }) }} />
                                )}
                            </FormItem>
                            <FormItem
                                style={{ display: 'flex', width: '50%', flexDirection: 'row', justifyContent: 'center' }}
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
                        </div>
                    }

                    {(this.state.ticket != undefined) &&
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: "100%", justifyContent: 'left' }}>
                            {this.state.frm_tercero &&
                                <div style={{ display: 'flex', width: '70%', flexDirection: 'row' }} >
                                    <FormItem
                                        label="Dpto."
                                        labelCol={{ span: 5 }}
                                        wrapperCol={{ span: 12 }}
                                    >
                                        {getFieldDecorator('departamento', {
                                            rules: [{ required: true, message: 'Por favor selecciona' }], initialValue: (this.state.frm_departamento ? String(this.state.frm_departamento) : undefined)
                                        })(
                                            <Select
                                                showSearch
                                                autoClearSearchValue
                                                placeholder="Selecciona Departamento"
                                                optionFilterProp="children"
                                                onChange={(seleccion) => { this.getUsuariosDepartamento(seleccion); this.setState({ frm_departamento: seleccion }) }}
                                                style={{ width: 200 }}
                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {this.state.departamentos_usuario.map((departamento) => (
                                                    <Option value={departamento.id_departamento}>{departamento.departamento}</Option>
                                                ))}
                                            </Select>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label="Empleado"
                                        labelCol={{ span: 8 }}
                                        wrapperCol={{ span: 12 }}
                                    >
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
                                                style={{ width: 200 }}
                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {this.state.empleados_departamento.map((empleado) => (
                                                    <Option value={empleado.id_usuario}>{empleado.nombre_completo}</Option>
                                                ))}
                                            </Select>
                                        )}
                                    </FormItem>
                                </div>
                            }

                            {this.state.frm_programada &&
                                <div style={{ display: 'flex', width: '30%', flexDirection: 'row' }} >
                                    <FormItem
                                        label="Fecha y Hora"
                                        labelCol={{ span: 8 }}
                                        wrapperCol={{ span: 12 }}
                                    >
                                        {getFieldDecorator('fecha', { rules: [{ required: (this.state.frm_programada ? true : false), message: 'Por favor selecciona' }] })(
                                            <DatePicker
                                                style={{ width: 200 }}
                                                format="YYYY-MM-DD HH:mm:ss"
                                                showTime={{ defaultValue: moment('HH:mm:ss') }}
                                                value={this.state.date}
                                                onChange={(value) => {
                                                    this.setState({ date : value});
                                                }}
                                            />
                                        )}
                                    </FormItem>
                                </div>
                            }
                        </div>
                    }

                    {(this.state.ticket != undefined) &&
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: "100%", justifyContent: 'left' }}>
                            <Upload
                                {...propsUpload}
                            >
                                <Button>
                                    <Icon type="upload" /> Imagen/Logo
                                </Button>
                            </Upload>
                        </div>
                    }

                    {(this.state.ticket != undefined) &&
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', width: "100%", justifyContent: 'center', marginTop: '2%' }}>
                            <Button onClick={this.aperturarTicket.bind(this)} type="primary" htmlType="submit" style={{ display: 'flex', width: '90%', justifyContent: 'center' }}>
                                Aperturar
                            </Button>
                        </div>
                    }
                </div>
            </div>
        )
    }

    getCategoria() {
        const { Server, id_usuario } = this.props;
        http._GET(Server + "configuracion/ticket.php?accion=get_categorias_ticket&id_usuario=" + id_usuario).then(res => {
            this.setState({ categorias: res });
        }).catch(err => {
            message.error("Error al cargar Tickets." + err);
            this.setState({ cargando: false });
        });
    }

    getTicketsCategoria(id_categoria) {
        const { Server } = this.props;
        http._GET(Server + "configuracion/ticket.php?accion=get_ticket_por_categoria&id_categoria=" + id_categoria).then(res => {
            this.setState({ tickets: res });
        }).catch(err => {
            message.error("Error al cargar Tickets." + err);
            this.setState({ cargando: false });
        });
    }

    cargarTicket(ticket) {

        const { Server , id_usuario } = this.props;
        this.setState({ cargando: true });
        var data = new FormData();
        data.append('id_ticket', ticket);
        data.append('id_usuario', id_usuario);

        http._POST(Server + 'configuracion/ticket.php?accion=get_ticket', data).then((res) => {
            console.log(res);
            this.setState({ ticket: res });
        }).catch(err => {
            message.error("Error al cargar Ticket." + err);
            this.setState({ cargando: false })
        });
    }

    getDepartamentosUsuario() {
        let Server = String(this.props.Server);
        this.setState({ cargando: true });
        var data = new FormData();
        data.append('id_usuario', this.props.id_usuario);

        http._POST(Server + 'configuracion/usuario.php?accion=get_departamentos_one', data).then((res) => {
            if (res.length > 0) {
                this.getUsuariosDepartamento(res[0]['id_departamento']);
                this.setState({
                    frm_departamento: res[0]['id_departamento'],
                    frm_empleado: this.props.id_usuario,
                    departamentos_usuario: res
                });
            }
            this.setState({ cargando: false });
        }).catch(err => {
            message.error("Error al obtener departamentos." + err);
            this.setState({ cargando: false });
        });
    }

    getUsuariosDepartamento(id_departamento) {
        let Server = String(this.props.Server);
        this.setState({ cargando: true });

        var data = new FormData();
        data.append('id_departamento', id_departamento);

        http._POST(Server + 'configuracion/usuario.php?accion=get_usuarios_departamento_one', data).then((res) => {
            this.setState({ cargando: false, empleados_departamento: res });
        }).catch(err => {
            message.error("Error al obtener departamentos." + err);
            this.setState({ cargando: false });
        });
    }

    onChange(info) {
        if (subiendo == true) {
            info.file.status = "done";
            subiendo = false
            message.success(`${info.file.name} imagen adjuntada correctamente.`);
        }
    }

    subirAdjunto({ onSuccess, onError, file }) {
        var temp = Array.from(this.state.files);
        temp.push(file);
        this.setState({ files: temp });
        subiendo = true;
    }

    borrarAdjunto(adjunto) {
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

    mesdnsajeInformacionAdicional(obj) {
        this.setState({ inf_adicional: obj.target.value });
    }

    aperturarTicket(e) {
        this.setState({ cargando: true })
        const { frm_programada, /*frm_tercero,*/ frm_empleado, inf_adicional, frm_departamento, ticket , date } = this.state;
        const {  Server }  = this.props;
        var programada = (frm_programada == true) ? 1 : 0;
        //var tercero = (frm_tercero == true) ? 1 : 0;

        var data = new FormData();
        data.append('info_adicional', inf_adicional);
        data.append('programada', programada);
        //data.append('tercero', tercero);
        data.append('fecha_programada', date.format("YYYY-MM-DD HH:mm:ss"));
        data.append('id_usuario', frm_empleado);
        data.append('id_departamento', frm_departamento);
        data.append('id_cargo', ticket.id_cargo);
        data.append('id_ticket', ticket.id_ticket);
        data.append('nivel_prioridad', ticket.prioridad_recomendada);
        if (this.state.files.length > 0) {
            this.state.files.forEach((e, i) => {
                data.append('file' + i, e);
            });
        }

        http._POST(Server + 'configuracion/ticket.php?accion=aperturar_ticket', data).then((res) => {
            if (res.err !== 'false') {
                this.setState({ modal_Ticket: false });
                message.success("Tickdet Enviada correctamente.");
                this.setState({ cargando: false, files: FileList });
                this.props.cerrarModalTickets();
                if (res.emails.length > 0) {
                    var data = new FormData();
                    data.append('para', res.emails[0]);
                    data.append('mensaje', res.mensaje);
                    data.append('copia', JSON.stringify(res.emails));
                    http._POST(Server + 'mail.php?accion=set', data).catch(err => console.log(err));
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

export default Form.create()(NuevoTicket);