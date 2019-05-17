import React, { Component } from 'react';

import Ticket_Vista_All from "../inicio/vistas_ticket/vista_ticket_all";
import http from '../services/http.services';

import { Grid } from 'semantic-ui-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip , Legend } from 'recharts';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import { Icon, Button, message, Form, Select, DatePicker , Tooltip as TooltipAntd , Switch  } from 'antd';
import Rodal from 'rodal';
import './dashboard.component.css';

var moment = require('moment');
require("moment/min/locales.min");
moment.locale('es');
const FormItem = Form.Item;
const Option = Select.Option;
const { MonthPicker } = DatePicker;

class Dashboad extends Component {

    constructor(props) {
        super(props);
        this.state = {
            select: 0,
            data: [],
            indicadores: {},
            color: ["#56b3ff", "#1890ff", "#1565C0"] ,
            modal_Usuario: false,
            user: {
                name: '',
                index: ''
            },
            detalle: [],
            id_usuario_ticket: null,
            id_departamento: null,
            date: moment(),
            todos: false
        }
        this.handleSelect = this.handleSelect.bind(this);
        this.handleModal = this.handleModal.bind(this);
    }

    componentDidMount() {
        this.getIndicadores(this.props.departamentos[0].id_departamento);
        this.getEstadistica(0, this.props.departamentos[0].id_departamento);
    }

    render() {
        const { select, color, data, indicadores , id_departamento , date , todos , cargando } = this.state;
        const { accesos, departamentos, rol } = this.props;
        return (
            <div className="content-dashboard">
                {this.modalUsuario()}
                {this.modalVerTicket()}
                <div>
                    <Grid className="grid" container columns={3} padded stackable>
                        {
                            accesos['tictets_abiertos'] &&
                            <Grid.Column >
                                <div className="grid-colum"
                                    style={{ background: (select == 0) ? color[select] : '' }}
                                    onClick={this.handleSelect(0)}
                                >
                                    <div className="icon">
                                        <Icon type="unlock" style={{ color: (select == 0) ? 'white' : '' }} />
                                    </div>
                                    <div className="text">
                                        Tickets Abiertos
                                        <p id="number" style={{ color: (select == 0) ? 'white' : '' }}>
                                            {(indicadores["abiertos"]) ? indicadores["abiertos"] : 0}
                                        </p>
                                    </div>
                                </div>
                            </Grid.Column>
                        }
                        {
                            accesos['tictets_cerrador'] &&
                            <Grid.Column >
                                <div className="grid-colum"
                                    style={{ background: (select == 1) ? color[select] : '' }}
                                    onClick={this.handleSelect(1)}
                                >
                                    <div className="icon">
                                        <Icon type="lock" style={{ color: (select == 1) ? 'white' : '' }} />
                                    </div>
                                    <div className="text">
                                        Tickets Cerrados
                                        <p id="number" style={{ color: (select == 1) ? 'white' : '' }}>
                                            {(indicadores["cerrados"]) ? indicadores["cerrados"] : 0}
                                        </p>
                                    </div>
                                </div>
                            </Grid.Column>
                        }
                        {
                            accesos['satisfaccion'] &&
                            <Grid.Column >
                                <div className="grid-colum"
                                    id={2}
                                    style={{ background: (select == 2) ? color[select] : '' }}
                                    onClick={this.handleSelect(2)}
                                >
                                    <div className="icon">
                                        <Icon type="pie-chart" style={{ color: (select == 2) ? 'white' : '' }} />
                                    </div>
                                    <div className="text">
                                        Satisfacción
                                        <p id="number" style={{ color: (select == 2) ? 'white' : '' }}>
                                            {(indicadores["satisfaccion"]) ? indicadores["satisfaccion"] : 0} %
                                        </p>
                                    </div>
                                </div>
                            </Grid.Column>
                        }
                    </Grid>
                </div>
                <div className="stadistic">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            onClick={this.handleModal}>
                            <XAxis dataKey="usuario" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={select != 2 ? 'tickers' : 'porcentaje'} fill={color[select]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flex: 1, flexDirection: 'row',  width: '100%', padding: '5%' }}>
                    <div style={{ width: '20%', height: '30%', paddingTop: '5px' }}>
                        <MonthPicker
                            id="datepicker"
                            style={{ width: '100%' }}
                            format="YYYY-MM"
                            value={this.state.date}
                            onChange={(value) => {
                                this.handleChangeDate(value);
                            }}
                        />
                    </div>
                    {rol != 1 &&
                        <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                            <FormItem style={{ paddingLeft: '5%' ,  width: '20%'}}>
                                <Select
                                    showSearch
                                    autoClearSearchValue
                                    placeholder="Selecciona Departamento"
                                    optionFilterProp="children"
                                    defaultValue={(departamentos.length > 0 ? departamentos[0]['departamento'] : null)}
                                    onChange={(seleccion) => { this.setState({ id_departamento: seleccion }); this.getIndicadores(seleccion); this.getEstadistica(0, seleccion); }}
                                    style={{ width: '80%' }}
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {
                                        departamentos.map((departamento, i) => (
                                            <Option key={i} value={departamento.id_departamento}>{departamento.departamento}</Option>
                                        ))
                                    }
                                </Select>
                            </FormItem>                  

                            <FormItem style={{ display: 'flex', justifyContent: 'flex-end' }}
                                label={(
                                    <span>
                                        Todos&nbsp;
                                        <TooltipAntd title="Permitir filtrar por todos los ticker ingresados al sistema.">
                                            <Icon type="question-circle-o" />
                                        </TooltipAntd>
                                    </span>
                                    )}
                                >
                                <Switch 
                                    loading={cargando} 
                                    defaultChecked={todos} 
                                    onChange={(valor) => { 
                                        this.setState({todos : valor}) ; 
                                        console.log(todos , valor);
                                        this.getIndicadores(id_departamento , null , valor);
                                        this.getEstadistica(select , id_departamento , null , valor);
                                    }} />
                            </FormItem>
                        </div>
                     }
                </div>
            </div>
        )
    }

    handleChangeDate(value) {
        this.setState({ date: value });
        const { id_departamento, select } = this.state;
        this.getIndicadores(id_departamento, value);
        this.getEstadistica(select, id_departamento, value);
    }

    getIndicadores(id_departamento, date = null , todos = null ) {
        const { Server, _usuario, rol } = this.props;
        var mes = (date != null) ? date : this.state.date;
        var data = new FormData();
        var t = (todos == null) ? ((this.state.todos == false) ? 0 : 1) : ((todos == false ) ? 0 : 1);
        data.append('_usuario', _usuario);
        data.append('id_departamento', id_departamento);
        data.append('rol', rol);
        data.append('mes', mes.format('YYYY-MM-DD'));
        data.append('todos', t);

        http._POST(String(Server) + 'dashboad/dashboad.php?get', data).then((res) => {
            this.setState({ todos : (t == 1) ? true : false , id_departamento: id_departamento, indicadores: res });
        }).catch(err => {
            message.error("Error al cargar informacion." + err);
        });
    }

    getEstadistica(estado, id_departamento = null, date = null , todos = null) {
        const { Server, rol, _usuario } = this.props;
        var departamento = (id_departamento != null) ? id_departamento : this.state.id_departamento;
        var mes = (date != null) ? date : this.state.date;
        var data = new FormData();
        var t = (todos == null) ? ((this.state.todos == false) ? 0 : 1) : ((todos == false ) ? 0 : 1);
        data.append('id_departamento', departamento);
        data.append('rol', rol);
        data.append('estado', estado);
        data.append('_usuario', _usuario);
        data.append('mes', mes.format('YYYY-MM-DD'));       
        data.append('todos', t);

        http._POST(String(Server) + 'dashboad/dashboad.php?grafica=true', data).then((res) => {
            this.setState({ todos : (t == 1) ? true : false , data: res, id_departamento: departamento });
            this.setState({ select: estado });
        }).catch(err => {
            message.error("Error al cargar grafica." + err);
        });
    }

    handleSelect = (id) => (e) => {
        this.setState({ select: id });
        this.getEstadistica(id);
    }

    handleModal(e) {
        if (e != null && this.props.accesos['detalle_grafica']) {
            const { Server, _usuario , rol} = this.props;
            const { tecnico, estado } = e["activePayload"][0]["payload"];
            const { select, id_departamento } = this.state;
            var mes = (this.state.date != null) ? this.state.date : moment();
            var t = (this.state.todos == false) ? 0 : 1;

            var data = new FormData();
            data.append('tecnico', tecnico);
            data.append('estado', estado);
            data.append('select', select);
            data.append('_usuario', _usuario);
            data.append('id_departamento', id_departamento);
            data.append('mes', mes.format('YYYY-MM-DD'));
            data.append('todos', t);
            data.append('rol', rol);

            http._POST(String(Server) + 'dashboad/dashboad.php?detalle=true', data).then((res) => {
                this.setState({
                    detalle: res,
                    modal_Usuario: !this.state.modal_Usuario,
                    user: {
                        name: e["activeLabel"],
                        index: e["activeTooltipIndex"]
                    }
                });
            }).catch(err => {
                message.error("Error al cargar informacion." + err);
            });
        }
    }

    verTicket(value) {
        const { _usuario } = this.props;
        var modalidad =  (value["id_usuaio"] == _usuario ) ? "usuario" : "soporte";
        this.setState({
            id_usuario_ticket: value["id_usuario_ticket"],
            modalidad: modalidad ,
            modal_verTicket: true
        });
    }

    cerrarModalVerTicket() {
        this.setState({ modal_verTicket: false });
    }

    modalVerTicket() {
        const { modal_verTicket, id_usuario_ticket, modalidad } = this.state;
        const { Server , _usuario } = this.props;

        return (
            <Rodal
                animation={'fade'}
                visible={modal_verTicket}
                onClose={() => { this.setState({ modal_verTicket: false }) }}
                closeMaskOnClick
                showCloseButton={true}
                customStyles={{ borderRadius: 10, height: '67%', width: '50%' }}
            >
                {(this.state.modal_verTicket) &&
                    <div style={{ width: '100%', height: '100%' }}>
                        <Ticket_Vista_All
                            getTicketsAbiertas={this.getTicketsAbiertas.bind(this)}
                            Server={Server}
                            modalidad={modalidad}
                            id_usuario_ticket={id_usuario_ticket} id_usuario={_usuario} cerrarModalVerTicket={this.cerrarModalVerTicket.bind(this)} />
                    </div>
                }
            </Rodal>
        )
    }

    getTicketsAbiertas() {
        /*this.getIndicadores();
        this.getEstadistica(this.state.select);*/
        this.getIndicadores(this.state.id_departamento);
        this.getEstadistica(this.state.select, this.state.id_departamento);
    }

    modalUsuario() {
        const { modal_Usuario, user, detalle } = this.state;
        const { accesos } = this.props;
        return (
            <Rodal
                animation={'slideUp'}
                visible={modal_Usuario}
                height={480}
                width={1000}
                onClose={() => { this.setState({ modal_Usuario: !modal_Usuario }) }}
                closeMaskOnClick
                showCloseButton={true}
                customStyles={{ borderRadius: 10 }}
            >
                {(modal_Usuario) &&
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <h2 style={{ display: 'flex', flex: 1, justifyContent: 'center', }}>
                                {user.name}
                            </h2>
                        </div>
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
                                rowData={detalle}>
                                <AgGridColumn headerName="Ticket" field={"ticket"} />
                                <AgGridColumn headerName="Estado" field="estado" />
                                <AgGridColumn headerName="Usuario" field="usuario" />
                                <AgGridColumn headerName="Departamento" field={"departamento"} />
                                <AgGridColumn headerName="Fecha" field={"fecha"} />
                                {accesos['detalle_de_tickets'] &&
                                    <AgGridColumn suppressFilter headerName=" " field={"data"}
                                        cellRendererFramework={(param) => {
                                            return (
                                                <Button onClick={() => { this.verTicket(param.data) }} type="primary" htmlType="button" style={{ marginLeft: 10, height: '70%', width: '55%', justifyContent: 'center', alignItems: 'center', fontSize: 10 }}>
                                                    <Icon type="eye" style={{ color: 'white', fontSize: 10, }} />
                                                </Button>
                                            )
                                        }}
                                    />
                                }
                            </AgGridReact>
                        </div>
                    </div>
                }
            </Rodal>
        )
    }
}

export default Dashboad;