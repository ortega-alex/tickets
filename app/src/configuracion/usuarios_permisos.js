import React, { Component } from 'react';

import Form_NuevoUsuario from "./forms/nuevo_usuario"
import VerUsuario from "../configuracion/ver_usuario"
import Rodal from 'rodal';
import { Icon, Tooltip, message, Button, Switch } from 'antd';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import http from '../services/http.services';

var moment = require('moment');

class UsuarioPermisos extends Component {

  componentDidMount() {
    this.getUsuarios();
    this.getRolUsuarios();
  }

  constructor(props) {
    super(props);
    this.state = {
      usuarios: [],
      roles: [] ,
      rol: undefined,
      modal_nuevoUsuario: false,
      usuario_ficha: undefined,
    }
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', padding: "10px", flex: 1, height: '100%', width: '100%' }}>
        {this.modalUsuario()}
        {this.modalNuevoUsuario()}

        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', height: '10%', alignItems: 'flex-end' }}>
          <Tooltip title="Usuario Nuevo" placement="left">
            <Button
              type="button"
              onClick={this.solicitar_nuevoUsuario.bind(this)}
              style={{ backgroundColor: 'transparent', width: 40, border: 'none', borderColor: 'red', outline: 'none' }}
            >
              <Icon type="user-add" style={{ color: '#3498DB', fontSize: 20 }} />
            </Button>
          </Tooltip>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3>Usuarios</h3>
          Se muestra el listado de usuarios del Sistema de Tickets.
      </div>

        <div
          className="ag-theme-balham"
          style={{
            width: '100%',
            height: '95%',
            padding: '30px',
          }}
        >
          <AgGridReact
            floatingFilter={true}
            enableSorting={true}
            animateRows={true}
            enableColResize={true}
            rowSelection='single'
            onGridReady={(params) => { params.api.sizeColumnsToFit(); }}
            rowData={this.state.usuarios}>
            <AgGridColumn singleClickEdit suppressSizeToFit headerName="Nombre" field={"data.nombre_completo"} />
            <AgGridColumn headerName="Puesto" field={"data"}
              cellRendererFramework={(param) => {

                return (
                  <div>
                    {(parseInt(param.value.asignaciones) > 1) &&
                      <div>
                        {param.value.puesto} y {parseInt(param.value.asignaciones) - 1} más...
                  </div>
                    }
                    {(parseInt(param.value.asignaciones) == 1) &&
                      <div>
                        {param.value.puesto}
                      </div>
                    }
                    {(parseInt(param.value.asignaciones) == 0) &&
                      <div style={{ color: 'gray' }}>
                        {param.value.puesto}
                      </div>
                    }
                  </div>
                )
              }}

            />
            <AgGridColumn headerName="Departamento" field={"data"}
              cellRendererFramework={(param) => {

                return (
                  <div>
                    {(parseInt(param.value.asignaciones) > 1) &&
                      <div>
                        {param.value.departamento} y otros...
                  </div>
                    }
                    {(parseInt(param.value.asignaciones) == 1) &&
                      <div>
                        {param.value.departamento}
                      </div>
                    }
                    {(parseInt(param.value.asignaciones) == 0) &&
                      <div style={{ color: 'gray' }}>
                        {param.value.departamento}
                      </div>
                    }

                  </div>
                )
              }}

            />
            <AgGridColumn headerName="Estado" field="data.estado_final.motivo" />
            <AgGridColumn headerName="Asignación" field={"data.creacion"} width={160} cellRenderer={(param) => { return moment(param).format('l') }} />
            <AgGridColumn suppressFilter headerName="Soporte" field={"data"} width={150}
              cellRendererFramework={(param) => {
                return (
                  <div>
                    {(parseInt(param.value.soporte) == 1) &&
                      <div style={{ display: 'flex', flexDirection: 'row', fontSize: 12, color: '#27AE60', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon type="tool" style={{ marginLeft: -19 }} />&nbsp;
                        Sí
                  </div>
                    }
                    {(parseInt(param.value.soporte) == 0) &&
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        No
                  </div>
                    }

                  </div>
                )
              }}
            />
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
                    <Button
                      type="button"
                      onClick={() => { this.cargarUsuarioEdicion(param.value.id_usuario) }}
                      style={{ backgroundColor: 'transparent', width: 40, border: 'none', borderColor: 'red', outline: 'none' }}
                    >
                      <Icon type="edit" style={{ color: '#B3B6B7', fontSize: 16 }} />
                    </Button>
                    <Tooltip title={motivo} placement='right'>
                      <div>
                        <Switch size="small" disabled={!directo} defaultChecked={activo} onChange={(valor) => { this.cambiarEstadoUsuario(param.value.id_usuario, valor) }} />
                      </div>
                    </Tooltip>
                    <Button onClick={() => { this.verFicha(param.value) }} type="primary" htmlType="button" style={{ display: 'flex', marginLeft: 10, height: '70%', width: '55%', justifyContent: 'center', alignItems: 'center', fontSize: 10 }}>
                      <Icon type="solution" style={{ color: 'white', fontSize: 10, }} /> Ficha
                  </Button>
                  </div>
                )
              }}
            />
          </AgGridReact>
        </div>
      </div>
    );
  }

  solicitar_nuevoUsuario() {
    this.setState({ 
      usuario_edicion: undefined,
      rol : undefined , 
      modal_nuevoUsuario: true 
    });
  }

  modalUsuario() {
    const { modal_Usuario, usuario_ficha, id_usuario } = this.state;
    const { Server , _usuario } = this.props;
    return (
      <Rodal
        animation={'slideUp'}
        visible={modal_Usuario}
        height={480}
        width={700}
        onClose={() => { this.setState({ modal_Usuario: !modal_Usuario, usuario_ficha: undefined }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(modal_Usuario) &&
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <VerUsuario _usuario={_usuario} usuario_ficha={usuario_ficha} getUsuarios={this.getUsuarios.bind(this)} id_usuario={id_usuario} Server={Server} />
          </div>
        }
      </Rodal>
    )
  }

  modalNuevoUsuario() {
    const { modal_nuevoUsuario } = this.state;
    const { Server , _usuario} = this.props;
    return (
      <Rodal
        animation={'slideDown'}
        visible={modal_nuevoUsuario}
        height={600}
        width={450}
        onClose={() => { this.setState({ modal_nuevoUsuario: !modal_nuevoUsuario }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(modal_nuevoUsuario) &&
          <Form_NuevoUsuario _usuario={_usuario} getUsuarios={this.getUsuarios.bind(this)} usuario_edicion={this.state.usuario_edicion} roles={this.state.roles} rol={this.state.rol} Server={Server} closeModalNuevoUsuario={this.closeModalNuevoUsuario.bind(this)} />
        }
      </Rodal>
    )
  }

  closeModalNuevoUsuario() {
    this.setState({ usuario_edicion: undefined, modal_nuevoUsuario: false })
    this.getUsuarios()
  }

  verFicha(parametros) {
    this.setState({ id_usuario: parametros.id_usuario, usuario_ficha: parametros }, () => {
      this.setState({ modal_Usuario: true })
    })
  }

  cargarUsuarioEdicion(id_usuario) {

    let Server = String(this.props.Server)
    this.setState({ cargando: true })
    var data = new FormData();
    data.append('id_usuario', id_usuario);

    http._POST(Server + 'configuracion/usuario.php?accion=one', data).then((res) => {
      if (res !== 'error') {
        this.setState({ usuario_edicion: undefined }, () => {
          this.setState({ 
            usuario_edicion: res ,
            rol : res['id_rol'] ,
            modal_nuevoUsuario: true 
          });
        });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Usuario.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Usuario." + err);
      this.setState({ cargando: false });
    });
  }

  cambiarEstadoUsuario(id_usuario, estado) {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var cambiar_a = 1;
    if (!estado) {
      cambiar_a = 0;
    }

    var data = new FormData();
    data.append('id_usuario', id_usuario);
    data.append('estado', cambiar_a);
    data.append('_usuario', this.props._usuario);

    http._POST(Server + 'configuracion/usuario.php?accion=cambiar_estado', data).then((res) => {
      if (res !== 'error') {
        this.setState({ cargando: false });
        this.getUsuarios();
      } else {
        message.error("Error al actualizar puestos.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al actualizar puestos." + err);
      this.setState({ cargando: false });
    });
  }

  getRolUsuarios(){
    let Server = String(this.props.Server)
    this.setState({ cargando: true });

    http._GET(Server + 'configuracion/usuario.php?accion=get_rol_usuarios').then(res => {
      this.setState({ 
        roles: res ,
        cargando: false 
      });
    }).catch(err => {
      message.error("Error al cargar Asignaciones." + err);
      this.setState({ cargando: false });
    });
  }

  getUsuarios() {

    let Server = String(this.props.Server)
    this.setState({ cargando: true });

    http._GET(Server + 'configuracion/usuario.php?accion=get_usuarios_all').then((res) => {
      if (res !== 'error') {
        let resultado = new Array()
        for (const objecto of res) {
          resultado.push(
            {
              data: {
                id_usuario: objecto.id_usuario,
                username: objecto.username,
                email: objecto.email,
                nombre_completo: objecto.nombre_completo,
                estado: objecto.estado,
                id_configuracion: objecto.id_configuracion,
                creacion: objecto.creacion,
                soporte: objecto.soporte,
                departamento: objecto.departamento,
                puesto: objecto.puesto,
                asignaciones: objecto.asignaciones,
                estado_final: JSON.parse(objecto.estado_final),
              }
            }
          )
        }
        this.setState({ usuarios: resultado });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Asignaciones.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Asignaciones." + err);
      this.setState({ cargando: false });
    });
  }
}

export default UsuarioPermisos;