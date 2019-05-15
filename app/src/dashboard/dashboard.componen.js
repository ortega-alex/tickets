import React, { Component } from 'react';

import Ticket_Vista_All from "../inicio/vistas_ticket/vista_ticket_all";
import http from '../services/http.services';

import { Grid } from 'semantic-ui-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import { Icon, Button, message, Form, Select } from 'antd';
import Rodal from 'rodal';
import './dashboard.component.css';

const FormItem = Form.Item;
const Option = Select.Option;

class Dashboad extends Component {

    constructor(props) {
        super(props);
        this.state = {
            select: 0,
            data: [],
            indicadores: {},
            color: ["#56b3ff", "#1890ff", "#1565C0"],
            modal_Usuario: false,
            user: {
                name: '',
                index: ''
            },
            detalle: [],
            id_usuario_ticket: null,
            id_departamento : null
        }
        this.handleSelect = this.handleSelect.bind(this);
        this.handleModal = this.handleModal.bind(this);
        console.log(this.props);
    }

    componentDidMount() {
        console.log("props" , this.props);
        this.getIndicadores(this.props.departamentos[0].id_departamento);
        this.getEstadistica( 0 , this.props.departamentos[0].id_departamento);
    }

    render() {
        const { select, color, data, indicadores  } = this.state;
        const { accesos, _usuario , departamentos , rol } = this.props;
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
                                            {  (indicadores["abiertos"]) ? indicadores["abiertos"] : 0  }
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
                                            { (indicadores["cerrados"]) ? indicadores["cerrados"] : 0  }
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
                                            { (indicadores["satisfaccion"]) ? indicadores["satisfaccion"] : 0  } %
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
                            onClick={this.handleModal}                        >
                            <XAxis dataKey="usuario" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={select != 2 ? 'tickers' : 'porcentaje'} fill={color[select]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                { rol != 1 && 
                    <div style={{ display: 'flex', flexDirection: 'row', height: '50%', width: '100%' , alignItems : 'center'}}>
                        <FormItem style={{ width: '25%', paddingLeft: '10%' }}>
                            <Select
                                showSearch
                                autoClearSearchValue
                                placeholder="Selecciona Departamento"
                                optionFilterProp="children"
                                defaultValue={( departamentos.length > 0 ? departamentos[0]['departamento'] : null)}
                                onChange={(seleccion) => { this.setState({id_departamento : seleccion })  ; this.getIndicadores(seleccion) ; this.getEstadistica(0 , seleccion) ; }}
                                style={{ width: '80%' }}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {
                                    departamentos.map((departamento , i) => (
                                        <Option key={i} value={departamento.id_departamento}>{departamento.departamento}</Option>
                                    ))
                                }
                            </Select>
                        </FormItem>
                    </div>
                }                
            </div>
        )
    }

    getIndicadores(id_departamento) {
        const { Server, _usuario , rol } = this.props;
        var data = new FormData();
        data.append('id_usuario', _usuario);
        data.append('id_departamento', id_departamento);
        data.append('rol', rol);

        http._POST(String(Server) + 'dashboad/dashboad.php?get' , data ).then((res) => {
            this.setState({ id_departamento : id_departamento , indicadores: res });
        }).catch(err => {
            message.error("Error al cargar informacion." + err);
        });
    }

    getEstadistica(estado , id_departamento = null) {
        const { Server , rol , _usuario } = this.props;
        var departamento = ( id_departamento != null ) ? id_departamento : this.state.id_departamento ;
        var data = new FormData();
        data.append('id_departamento', departamento);
        data.append('rol', rol);
        data.append('estado' , estado); 
        data.append('_usuario', _usuario);
        
        http._POST(String(Server) + 'dashboad/dashboad.php?grafica=true' , data ).then((res) => {
            this.setState({ data: res });
            this.setState({select : estado});
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
            const { tecnico, estado } = e["activePayload"][0]["payload"];
            const { select } = this.state;

            var data = new FormData();
            data.append('tecnico', tecnico);
            data.append('estado', estado);
            data.append('select', select);

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
        this.setState({
            id_usuario_ticket: value["id_usuario_ticket"],
            modalidad: (value["estado"] == "Abierto") ? "tickets_abiertas" : "tickets_cerradas",
            modal_verTicket: true
        });
    }

    cerrarModalVerTicket() {
        this.setState({ modal_verTicket: false });
    }

    modalVerTicket() {
        const { modal_verTicket, id_usuario_ticket, modalidad } = this.state;
        const { Server } = this.props;
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
                            id_usuario_ticket={id_usuario_ticket} id_usuario={id_usuario} cerrarModalVerTicket={this.cerrarModalVerTicket.bind(this)} />
                    </div>
                }
            </Rodal>
        )
    }

    getTicketsAbiertas() {
        this.getIndicadores();
        this.getEstadistica(this.state.select);
    }

    modalUsuario() {
        const { modal_Usuario, user, detalle } = this.state;
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