import React, { Component } from 'react';

import Form_NuevoUsuario from "./forms/nuevo_usuario"
import Form_Asignacion from "./forms/nueva_asignacion"
import Rodal from 'rodal';
import { Grid } from 'semantic-ui-react'
import { Icon, Form, Tabs, Tooltip, message, Button, Switch } from 'antd';

import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import http from '../services/http.services';

var moment = require('moment');
require("moment/min/locales.min");
moment.locale('es');
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

//var subiendo=false

class ver_departamento extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      modal_Asignacion: false,
      modal_Dpto: false,
      frm_activo: true,
      departamento: undefined,
      departamento_edicion: undefined,
      cargando: false,
      tab: 1,
    }
  }

  componentDidMount() {
    this.cargarDepartamento()
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }} >
        <div style={{ marginRight: 40, display: 'flex', flexDirection: 'row', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ display: 'flex', flex: 1, justifyContent: 'center', }}>
            {(this.state.departamento !== undefined) && this.state.departamento.departamento}
          </h2>
          {(this.state.departamento && this.props.accesos['Activar/Desactivar_Departamento']) &&
            <FormItem
              style={{ display: 'flex', justifyContent: 'flex-end' }}
              label={(
                <span>
                  Activo&nbsp;
                  <Tooltip title="Si inactivas un departamento, sus usarios pertenecientes no podrán crear tickets.">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )}
            >
              <Switch loading={this.state.cargando} defaultChecked={this.state.departamento.estado == 1 ? true : false} onChange={(valor) => { this.cambiarEstadoDepartamento(valor) }} />
            </FormItem>
          }
        </div>
        {(this.state.departamento) &&
          <Tabs defaultActiveKey={this.state.tab.toString()}
            onTabClick={(tab) => {
              this.setState({ tab: tab })
            }}>
            <TabPane forceRender tab="Usuarios Asignados" key="1">
              <ModuloPuestos rol={this.props.rol} accesos={this.props.accesos} _usuario={this.props._usuario} getDepartamentos={this.props.getDepartamentos.bind(this)} Server={this.props.Server} id_departamento={this.props.id_departamento} />
            </TabPane>
            <TabPane forceRender tab="Puestos" key="2">
              <PuestosDpto accesos={this.props.accesos} _usuario={this.props._usuario} getDepartamentos={this.props.getDepartamentos.bind(this)} Server={this.props.Server} id_departamento={this.props.id_departamento} />
            </TabPane>
            <TabPane forceRender tab="Tickets Generadas" key="3">
              <TicketsGeneradas Server={this.props.Server} id_departamento={this.props.id_departamento} />
            </TabPane>
          </Tabs>
        }
      </div>
    );
  }

  cambiarEstadoDepartamento(estado) {
    let Server = String(this.props.Server)
    this.setState({ cargando: true })

    var cambiar_a = (!estado) ? 0 : 1;

    var data = new FormData();
    data.append('id_departamento', this.props.id_departamento);
    data.append('estado', cambiar_a);
    data.append('nombre_departamento', this.state.departamento.departamento);
    data.append('_usuario', this.props._usuario);

    http._POST(Server + 'configuracion/departamento.php?accion=estado', data).then(res => {
      if (res !== 'error') {
        this.setState({ cargando: false });
        this.cargarDepartamento();
        this.props.getDepartamentos();
      } else {
        message.error("Error al actualizar estado.");
        this.setState({ cargando: false })
      }
    }).catch(err => {
      message.error("Error al actualizar estado." + err);
      this.setState({ cargando: false });
    });
  }

  cargarDepartamento() {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var data = new FormData();
    data.append('id_departamento', this.props.id_departamento);

    http._POST(Server + 'configuracion/departamento.php?accion=one', data).then(res => {
      if (res !== 'error') {
        this.setState({ departamento: undefined }, () => {
          this.setState({ departamento: res });
        });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Departamento.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Departamento." + err);
      this.setState({ cargando: false });
    });
  }
}

class UsuariosAsignados extends Component {

  constructor(props) {
    super(props);

    this.state = {
      modal_Asignacion: false,
      frm_usuarioexistente: true,
      asignacion_puesto: undefined,
      asignacion_departamento: undefined,
      asignacion_usuario: undefined,
      modal_nuevoUsuario: false,
      nuevo_usuario_activo: true,
      id_usuario: undefined,
      id_departamento: undefined,
      usuarios_departamento: [],
      searchText: '',
      edit_asignacion_usuario: undefined
    }
  }

  componentDidMount() {
    this.getUsuariosDepartamento()
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }} >
        {this.modalAsignacion()}
        {this.modalNuevoUsuario()}
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
            rowData={this.state.usuarios_departamento}>
            <AgGridColumn suppressSizeToFit headerName="Nombre" field={"data.usuario.nombre_completo"} />
            <AgGridColumn headerName="Puesto" field="data.puesto.puesto" />
            <AgGridColumn headerName="Estado" field="data.estado_final.motivo" />
            <AgGridColumn headerName="Fecha Asignación" field={"data.creacion"} cellRenderer={(param) => { return moment(param).format('ll') }} />
            <AgGridColumn suppressFilter headerName=" " field={"data"}
              cellRendererFramework={(param) => {
                var activo = true
                var directo = true
                var motivo = "Activar/Desactivar"
                if (param.value.estado_final.estado == "Inactivo") {
                  activo = false
                }
                if (param.value.estado_final.directo == "No") {
                  directo = false
                  motivo = "Acción no permitida! " + param.value.estado_final.motivo
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'row', height: '25px', justifyContent: 'center', alignItems: 'center' }}>
                     {this.props.accesos['Editar_Usuario'] &&
                      <Button
                        type="button"
                        onClick={() => { this.cargarAsignacionEdicion(param.value , activo) }}
                        style={{ backgroundColor: 'transparent', width: 40, border: 'none', borderColor: 'red', outline: 'none' }}
                      >
                        <Icon type="edit" style={{ color: '#B3B6B7', fontSize: 16 }} />
                      </Button>
                    }
                    { this.props.accesos['Activar/Desactivar_Puesto_Por_Departamento'] &&
                    <Tooltip title={motivo} placement='right'>
                      <div>
                        <Switch size="small" disabled={!directo} defaultChecked={activo} onChange={(valor) => { this.cambiarEstadoAsignacion(param.value.id_cargo, valor) }} style={{ marginLeft: 10 }} />
                      </div>
                    </Tooltip>
                    }
                  </div>
                )
              }}
            />      
          </AgGridReact>     
        </div>
        { this.props.accesos['Nueva_Asignacion_Por_Departamento'] && 
          <div style={{ display: 'flex', flex: 1, height: "10%", width: '100%', justifyContent: 'flex-end', alignItems: 'center', marginTop: 5, paddingRight: 20 }}>
            <Button onClick={() => { this.solicitoAsignacion() }} type="primary" htmlType="button" style={{ display: 'flex', width: '30%', justifyContent: 'center', alignItems: 'center' }}>
              <Icon type="plus-circle" style={{ color: 'white', fontSize: 13 }} /> Nueva Asignación
            </Button>
          </div>
        }        
      </div>
    )
  }

  cambiarEstadoAsignacion(id_cargo, estado) {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var cambiar_a = (!estado) ? 0 : 1;

    var data = new FormData();
    data.append('id_cargo', id_cargo);
    data.append('estado', cambiar_a);
    data.append('_usuario', this.props._usuario);

    http._POST(Server + 'configuracion/departamento.php?accion=estado_asignacion', data).then(res => {
      if (res !== 'error') {
        this.setState({ cargando: false });
        this.getUsuariosDepartamento();
        this.props.getDepartamentos();
      } else {
        message.error("Error al actualizar puestos.");
        this.setState({ cargando: false })
      }
    }).catch(err => {
      message.error("Error al actualizar puestos." + err);
      this.setState({ cargando: false });
    });
  }

  handleSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  handleReset = clearFilters => () => {
    clearFilters();
    this.setState({ searchText: '' });
  }

  cargarAsignacionEdicion(data , activo) {
    this.setState({
      edit_asignacion_usuario : {
        id_cargo : data['id_cargo'] ,
        id_departamento : data['departamento']['id_departamento'] ,
        id_usuario : data['usuario']['id_usuario'] ,
        id_puesto: data['puesto']['id_puesto'] ,
        estado : activo 
      } ,      
      modal_Asignacion: true
    });
  }

  solicitoAsignacion() {
    this.setState({ edit_asignacion_usuario : undefined , modal_Asignacion: true });
  }

  modalAsignacion() {
    return (
      <Rodal
        animation={'flip'}
        visible={this.state.modal_Asignacion}
        width={450}
        height={450}
        onClose={() => { this.setState({ modal_Asignacion: !this.state.modal_Asignacion, id_usuario: undefined }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '10%', alignItems: 'center', justifyContent: 'flex-start' }}>
          <h2 style={{ textAlign: 'center' }}>
            { this.props.accesos['Nuevo_Usuario'] && 
              <Tooltip title="Crea un usuario si no existe">
                <button
                  type="button"
                  onClick={this.solicitar_nuevoUsuario.bind(this)}
                  style={{ backgroundColor: 'transparent', width: 40, border: 'none', borderColor: 'red', outline: 'none' }}
                >
                  <Icon type="user-add" style={{ color: '#3498DB', }} />
                </button>
              </Tooltip>
            }
            { (this.state.edit_asignacion_usuario) ? 'Edición ' : ''}  Asignación de Usuario
          </h2>
        </div>
        {(this.state.modal_Asignacion) &&
          <Form_Asignacion rol={this.props.rol} edit_asignacion_usuario={this.state.edit_asignacion_usuario} _usuario={this.props._usuario} getDepartamentos={this.props.getDepartamentos.bind(this)} closeModalAsignacion={this.closeModalAsignacion.bind(this)} Server={this.props.Server} id_departamento={this.props.id_departamento} id_usuario={this.state.id_usuario} />
        }
      </Rodal>
    )
  }

  solicitar_nuevoUsuario() {
    let Server = String(this.props.Server)
    this.setState({ cargando: true });

    http._GET(Server + 'configuracion/usuario.php?accion=get_rol_usuarios&rol=' + this.props.rol).then(res => {
      this.setState({
        roles: res,
        cargando: false ,
        modal_nuevoUsuario: true 
      });
    }).catch(err => {
      message.error("Error al cargar Asignaciones." + err);
      this.setState({ cargando: false });
    });
  }

  modalNuevoUsuario() {
    return (
      <Rodal
        animation={'slideDown'}
        visible={this.state.modal_nuevoUsuario}
        height={600}
        width={450}
        onClose={() => { this.setState({ modal_nuevoUsuario: !this.state.modal_nuevoUsuario }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(this.state.modal_nuevoUsuario) &&
          <Form_NuevoUsuario rol={this.props.rol} roles={this.state.roles} Server={this.props.Server} closeModalNuevoUsuario={this.closeModalNuevoUsuario.bind(this)} />
        }
      </Rodal>
    )
  }

  closeModalNuevoUsuario(nuevo_usuario) {
    this.setState({ modal_nuevoUsuario: false, id_usuario: nuevo_usuario })
    this.setState({ modal_Asignacion: false }, () => {
      setTimeout(() => {
        this.setState({ modal_Asignacion: true })
      }, 500)
    })
  }

  closeModalAsignacion(asignacion_creada) {
    this.setState({ modal_Asignacion: false })
    this.getUsuariosDepartamento()
  }

  getUsuariosDepartamento() {
    const { Server , id_departamento , rol , _usuario } = this.props;
    this.setState({ cargando: true })

    var data = new FormData();
    data.append('id_departamento', id_departamento);
    data.append('rol', rol);
    data.append('_usuario', _usuario);

    http._POST(Server + 'configuracion/departamento.php?accion=asignaciones', data).then(res => {
      if (res !== 'error') {
        let resultado = [];
        for (const objecto of res) {
          resultado.push(
            {
              data: {
                id_cargo: objecto.id_cargo,
                estado: objecto.estado,
                creacion: objecto.creacion,
                puesto: JSON.parse(objecto.puesto),
                departamento: JSON.parse(objecto.departamento),
                usuario: JSON.parse(objecto.usuario),
                estado_final: JSON.parse(objecto.estado_final)
              }
            }
          )
        }
        this.setState({ usuarios_departamento: resultado });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Asignaciones.");
        this.setState({ cargando: false })
      }
    }).catch(err => {
      message.error("Error al cargar Asignaciones." + err);
      this.setState({ cargando: false })
    });
  }
}

export const ModuloPuestos = Form.create()(UsuariosAsignados);

class PuestosDpto extends Component {

  constructor(props) {
    super(props);
    this.state = {
      puestos_departamento: [],
    }
  }

  componentDidMount() {
    this.getPuestosDepartamento()
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }} >
        <div style={{ textAlign: 'center' }}>
          Se muestran los puestos con los que cuenta el departamento
      </div>
        <div style={{ textAlign: 'center', fontSize: 9 }}>
          Si desactivas un puesto desde acá, sólo se desactivará a nivel de Departamento
      </div>
        <div style={{ padding: '10px', }}>
          <Grid columns='equal' colums={4} padded stackable >
            {this.state.puestos_departamento.map((puesto, i) => (
              <Grid.Column width={4} key={i}>
                <ItemPuesto accesos={this.props.accesos} _usuario={this.props._usuario} getDepartamentos={this.props.getDepartamentos.bind(this)} getPuestosDepartamento={this.getPuestosDepartamento.bind(this)} Server={this.props.Server} puesto={puesto.puesto} estado={puesto.estado_final} id_departamento={this.props.id_departamento} />
              </Grid.Column>
            ))}
          </Grid>
        </div>
      </div>
    )
  }

  getPuestosDepartamento() {
    const { Server , id_departamento } = this.props;
    this.setState({ cargando: true })

    var data = new FormData();
    data.append('id_departamento', id_departamento);   

    http._POST(Server + 'configuracion/departamento.php?accion=puestos', data).then(res => {
      if (res !== 'error') {
        let resultado = new Array()
        for (const objeto of res) {
          resultado.push(
            {
              puesto: JSON.parse(objeto.puesto),
              estado_final: JSON.parse(objeto.estado_final)
            }
          )
        }
        this.setState({ puestos_departamento: resultado })
        this.setState({ cargando: false })
      } else {
        message.error("Error al cargar Asignaciones.");
        this.setState({ cargando: false })
      }
    }).catch(err => {
      message.error("Error al cargar Asignaciones." + err);
      this.setState({ cargando: false })
    });
  }
}

class TicketsGeneradas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tickets: []
    };
  }

  componentDidMount() {
    this.getTickets();
  }

  render() {
    const { tickets } = this.state;
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }} >
        {tickets.length > 0 ?
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
              rowData={tickets}>
              <AgGridColumn headerName="Ticket" field={"nombre_ticket"} />
              <AgGridColumn headerName="Usuario" field={"nombre_completo"} />
              <AgGridColumn headerName="Estado" field={"estado"} />
              <AgGridColumn headerName="Fecha" field="creacion" cellRenderer={(param) => { return moment(param).format('ll') }} />
            </AgGridReact>
          </div>
          :
          <div style={{ textAlign: 'center', padding: 10 }}>
            <label>El departamento no a realizadon ningun ticket en el sistema.</label>
          </div>
        }
      </div>
    )
  }

  getTickets() {
    const { id_departamento, Server } = this.props;
    http._GET(Server + "configuracion/departamento.php?accion=get_tickets&id_departamento=" + id_departamento).then(res => {
      this.setState({ tickets: res });
    }).catch(err => {
      message.error("Error al obtener asignaciones." + err);
      this.setState({ cargando: false })
    });
  }
}

class ItemPuesto extends Component {

  render() {
    var activo = true
    var directo = true
    var motivo = "Activar/Desactivar"
    if (this.props.estado.estado == "Inactivo") {
      activo = false
    }
    if (this.props.estado.directo == "No") {
      directo = false
    }
    if (this.props.estado.directo == "No") {
      directo = false
      motivo = "Acción no permitida! " + this.props.estado.motivo
    }
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: 'white',
          boxShadow: '0px 1px 4px #909497',
          borderRadius: 10,
          border: 'none',
          borderColor: 'red',
          outline: 'none',
          height: '100%',
          width: '100%',
          padding: '5px'
        }}>
        {(!this.props.puesto.imagen) &&
          <div>
            {(this.props.estado.estado == 'Activo') &&
              <img src={require('../media/puesto_activo.png')} style={{ width: '50%' }} />
            }
            {(this.props.estado.estado == 'Inactivo') &&
              <img src={require('../media/puesto_inactivo.png')} style={{ width: '50%' }} />
            }
          </div>
        }
        <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap' }}>
          {this.props.puesto.puesto}
        </div>
        { this.props.accesos['Activar/Desactivar_Puesto_Por_Departamento'] && 
          <div style={{ flex: 'display', width: '100%', textAlign: 'right' }}>
            <Tooltip title={motivo} placement='right'>
              <div>
                <Switch defaultChecked={activo} disabled={!directo} size="small" onChange={(valor) => { this.cambiarEstadoPuestoDpto(valor) }} />
              </div>
            </Tooltip>
          </div>
        }        
        <div style={{ fontSize: 10 }}>
          {this.props.estado.motivo}
        </div>
      </div>
    )
  }

  cambiarEstadoPuestoDpto(estado) {
    let Server = String(this.props.Server)
    this.setState({ cargando: true })

    var cambiar_a = (!estado) ? 0 : 1;

    var data = new FormData();
    data.append('id_departamento', this.props.id_departamento);
    data.append('id_puesto', this.props.puesto.id_puesto);
    data.append('estado', cambiar_a);
    data.append('_usuario', this.props._usuario);
    data.append('puesto', this.props.puesto.puesto);

    http._POST(Server + 'configuracion/departamento.php?accion=estado_puestos', data).then(res => {
      if (res !== 'error') {
        this.setState({ cargando: false });
        this.props.getPuestosDepartamento();
        this.props.getDepartamentos();
      } else {
        message.error("Error al actualizar puestos.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al actualizar puestos." + err);
      this.setState({ cargando: false });
    });
  }
}

export default ver_departamento;