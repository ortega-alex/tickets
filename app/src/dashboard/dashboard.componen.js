import React, { Component } from 'react';

import Ticket_Vista_All from "../inicio/vistas_ticket/vista_ticket_all";
import http from '../services/http.services';

import { Grid } from 'semantic-ui-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import { Icon, Button, message } from 'antd';
import Rodal from 'rodal';

import './dashboard.component.css';

var moment = require('moment');

class Dashboad extends Component {

    constructor(props) {
        super(props);
        this.state = {
            select: 0,
            data : [] ,
            indicadores: {},
            color: ["#90CAF9", "#1890ff", "#1565C0"],
            modal_Usuario: false,
            user: {
                name: '',
                index: ''
            },
            detalle: [],
            ticket_abierta: {
                "categoria": "Desarrollo",
                "sub_categoria": "Correcciones",
                "nombre_ticket": "sadfsdfdsf",
                "procedimiento": "",
                "descripcion": "desssss",
                "id_usuario_ticket": "91",
                "nivel_prioridad": "3",
                "creacion": "2018-11-07 14:51:11",
                "programada": "0",
                "fecha_programada": "2018-11-07 14:51:11",
                "info_adicional": "",
                "username": "asdf",
                "nombre_completo": "marco duarte",
                "departamento": "Claro",
                "puesto": "Supervisor",
                "estado": "1",
                "id_calificacion": "16",
                "calificacion": "{\"id_calificacion\":\"16\",\"nivel_satisfaccion\":\"4.00\",\"tiempo_espera\":\"5.00\",\"amabilidad\":\"5.00\",\"conocimientos\":\"5.00\"}",
                "fases": "[{\"id_usuario_ticket_fase\":\"103\",\"id_fase\":\"1\",\"estado\":\"1\",\"fecha_inicio\":\"2018-11-07 14:51:11\",\"fecha_fin\":\"2018-11-07 14:51:34\",\"id_tecnico\":null,\"nombre_tecnico\":\"asdf\",\"resultado\":null,\"calificacion_fase\":\"0\",\"fase\":\"primera fase\",\"orden\":\"1\",\"tiempo_limite\":\"400\",\"color\":\"#F5ED54\"},{\"id_usuario_ticket_fase\":\"105\",\"id_fase\":\"2\",\"estado\":\"1\",\"fecha_inicio\":\"2018-11-07 14:51:34\",\"fecha_fin\":\"2018-11-07 14:51:35\",\"id_tecnico\":\"3\",\"nombre_tecnico\":\"marco duarte\",\"resultado\":null,\"calificacion_fase\":\"0\",\"fase\":\"segunda fase\",\"orden\":\"2\",\"tiempo_limite\":\"34\",\"color\":\"#40B81A\"}]",
                "mensajes": "[]"
            }
        }
        this.handleSelect = this.handleSelect.bind(this);
        this.handleModal = this.handleModal.bind(this);
        console.log(this.props, 'props');
    }

    componentDidMount() {
        this.getIndicadores();
        this.getEstadistica(0);
    }

    getIndicadores() {
        const { Server } = this.props;
        http._GET(String(Server) + 'dashboad/dashboad.php?get=true').then((res) => {
            this.setState({ indicadores: res });
        }).catch(err => {
            message.error("Error al cargar informacion." + err);
        });
    }

    getEstadistica(estado){
        const { Server } = this.props;
        http._GET(String(Server) + 'dashboad/dashboad.php?grafica=true&estado=' + estado).then((res) => {
            this.setState({ data: res });
        }).catch(err => {
            message.error("Error al cargar grafica." + err);
        });
    }

    handleSelect = (id) => (e) => {
        this.setState({ select: id });
        this.getEstadistica(id);
    }

    handleModal(e) {
        if (e != null) {
            const { Server } = this.props;
            http._GET(String(Server) + 'dashboad/dashboad.php?detalle=true&tecnico=' + e["activePayload"][0]["payload"]["tecnico"]).then((res) => {
                this.setState({
                    detalle : res ,
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
        console.log("value", value);
        this.setState({
            modal_verTicket: true
        });
    }

    cerrarModalVerTicket() {
        this.setState({ modal_verTicket: false });
    }

    modalVerTicket() {
        const { modal_verTicket, ticket_abierta } = this.state;
        const { Server } = this.props;
        const modalidad = 'tickets_abiertas_soporte';
        const id_usuario = 3;
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
                            modalidad={(modalidad == 'tickets_abiertas_soporte' || modalidad == 'tickets_cerradas_soporte') ? 'soporte' : 'usuario'}
                            id_usuario_ticket={ticket_abierta.id_usuario_ticket} id_usuario={id_usuario} cerrarModalVerTicket={this.cerrarModalVerTicket.bind(this)} />
                    </div>
                }
            </Rodal>
        )
    }

    getTicketsAbiertas() {
        const { Server, modalidad, fecha, id_usuario } = this.props;
        let server = String(Server);
        let accion = '';
        if (modalidad == 'tickets_abiertas') {
            accion = 'get_tickets_abiertas_usuario';
        } else if (modalidad == 'tickets_cerradas') {
            accion = 'get_tickets_cerradas_usuario';
        } else if (modalidad == 'tickets_abiertas_soporte') {
            accion = 'get_tickets_abiertas_soporte';
        } else if (modalidad == 'tickets_cerradas_soporte') {
            accion = 'get_tickets_cerradas_soporte';
        }

        this.setState({ cargando: true });
        var data = new FormData();
        data.append('id_usuario', id_usuario);

        if (fecha) {
            data.append('fecha', moment(fecha).format('YYYY-MM-DD'));
        }

        http._POST(server + 'configuracion/usuario.php?accion=' + accion, data).then((res) => {
            if (res !== 'error') {
                this.setState({ tickets_abiertas: res, tickets_abiertas_resultado: res });
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


    render() {
        const { select, color, data , indicadores } = this.state;
        
        return (
            <div className="content-dashboard">
                {this.modalUsuario()}
                {this.modalVerTicket()}
                <div>
                    <Grid className="grid" container columns={3} padded stackable>
                        <Grid.Column >
                            <div className="grid-colum"
                                style={{ background: (select == 0) ? '#97cdff' : '' }}
                                onClick={this.handleSelect(0)}
                            >
                                <div className="icon">
                                    <Icon type="unlock" />
                                </div>
                                <div className="text">
                                    Tickets Abiertos
                                    <p id="number">
                                        {indicadores["abiertos"]}
                                    </p>
                                </div>
                            </div>
                        </Grid.Column>
                        <Grid.Column >
                            <div className="grid-colum"
                                style={{ background: (select == 1) ? '#97cdff' : '' }}
                                onClick={this.handleSelect(1)}
                            >
                                <div className="icon">
                                    <Icon type="lock" />
                                </div>
                                <div className="text">
                                    Tickets Cerrados
                                    <p id="number">
                                        {indicadores["cerrados"]}
                                    </p>
                                </div>
                            </div>
                        </Grid.Column>
                        <Grid.Column >
                            <div className="grid-colum"
                                id={2}
                                style={{ background: (select == 2) ? '#97cdff' : '' }}
                                onClick={this.handleSelect(2)}
                            >
                                <div className="icon">
                                    <Icon type="pie-chart" />
                                </div>
                                <div className="text">
                                    Satisfacción
                                    <p id="number">
                                        {indicadores["satisfaccion"]} %
                                    </p>
                                </div>
                            </div>
                        </Grid.Column>
                    </Grid>
                </div>
                <div className="stadistic">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            onClick={this.handleModal}
                        >
                            <XAxis dataKey="usuario" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={select != 2 ? 'tickers' : 'porcentaje'} fill={color[select]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )
    }

    modalUsuario() {
        const { modal_Usuario, user, detalle } = this.state;
        return (
            <Rodal
                animation={'slideUp'}
                visible={modal_Usuario}
                height={480}
                width={700}
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
                                <AgGridColumn headerName="ticket" field={"ticket"} />
                                <AgGridColumn headerName="estado" field="estado" />
                                <AgGridColumn headerName="usuario" field="usuario" />
                                <AgGridColumn headerName="departamento" field={"departamento"} />
                                <AgGridColumn headerName="fecha" field={"fecha"} cellRenderer={(param) => { return moment(param).format('l') }}/>
                                <AgGridColumn suppressFilter headerName=" " field={"data"}
                                    cellRendererFramework={(param) => {
                                        return (
                                            <Button onClick={() => { this.verTicket(param.data) }} type="primary" htmlType="button" style={{ marginLeft: 10, height: '70%', width: '55%', justifyContent: 'center', alignItems: 'center', fontSize: 10 }}>
                                                <Icon type="eye" style={{ color: 'white', fontSize: 10, }} />
                                            </Button>
                                        )
                                    }}
                                />
                            </AgGridReact>
                        </div>
                    </div>
                }
            </Rodal>
        )
    }
}

export default Dashboad;