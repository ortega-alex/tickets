import React, { Component } from 'react';

import TicketsAsignacion from "../configuracion/forms/tickets_asignacion";
import TicketsSoporte from "../configuracion/forms/tickets_soporte";
import PerfilUsuario from "../configuracion/forms/perfil_usuario";
import _ from 'lodash';
import { Tree, Icon, Form, Tabs, Tooltip, message, Switch } from 'antd';
import http from '../services/http.services';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

class ver_puesto extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cargando: false,
      tickets_all: [],
      usuario: undefined,
      active_tab: 1,
    }
  }

  componentDidMount() {
    this.getTicketsAll();
  }

  componentWillMount() {
    this.cargarUsuario(this.props.usuario_ficha.id_usuario);
  }

  render() {
    const { usuario, cargando, tickets_all, active_tab } = this.state;
    const { id_usuario, Server , _usuario } = this.props;
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column", width: "100%", height: "100%" }} >
        {usuario &&
          <div>
            <div style={{ marginRight: 40, display: 'flex', flexDirection: 'row', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ display: 'flex', flex: 1, justifyContent: 'center', }}>
                {(usuario.nombre_completo !== undefined) && usuario.nombre_completo}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'row' }}>

                <FormItem
                  style={{ display: 'flex', justifyContent: 'flex-end', marginRight: 20 }}
                  label={(
                    <span>
                      Activo&nbsp;
                  <Tooltip title="Un usuario desactivado no podrá crear tickets.">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                  <Switch loading={cargando} defaultChecked={parseInt(usuario.estado) === 1 ? true : false} onChange={(valor) => { this.cambiarEstadoUsuario(valor) }} />
                </FormItem>

                <FormItem
                  style={{ display: 'flex', justifyContent: 'flex-end' }}
                  label={(
                    <span>
                      Soporte&nbsp;
                  <Tooltip title="Permitir al usuario brindar soporte (despachar tickets).">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                  <Switch loading={cargando} defaultChecked={parseInt(usuario.soporte) === 1 ? true : false} onChange={(valor) => { this.cambiarEstadoSoporte(valor) }} />
                </FormItem>
              </div>
            </div>

            <Tabs activeKey={String(active_tab)} defaultActiveKey={"1"} onChange={(key) => { this.setState({ active_tab: key }) }} style={{ display: 'flex', flex: 1, height: '100%', width: '100%', flexDirection: 'column', }} >
              {(tickets_all !== []) &&
                <TabPane tab="Tickets" key="1">
                  <PerfilTickets _usuario={_usuario} moveraSoporte={this.moveraSoporte.bind(this)} id_usuario={id_usuario} tickets_all={tickets_all} Server={Server} />
                </TabPane>
              }
              <TabPane tab="Historial" key="2">
                <Historial id_usuario={id_usuario} Server={this.props.Server} />
              </TabPane>
              <TabPane tab="Módulos" key="3">
                <PerfilPermisos _usuario={_usuario} id_usuario={id_usuario} Server={this.props.Server} />
              </TabPane>
              {(parseInt(this.state.usuario.soporte) === 1) &&
                <TabPane tab="Soporte" key="4">
                  <PerfilTicketsSoporte  _usuario={_usuario} usuario={usuario} id_usuario={id_usuario} tickets_all={tickets_all} Server={this.props.Server} />
                </TabPane>
              }
            </Tabs>
          </div>
        }
      </div>
    );
  }

  moveraSoporte() {
    if (parseInt(this.state.usuario.soporte) === 1) {
      setTimeout(() => {
        this.setState({ active_tab: 4 });
      }, 1000);
    }
  }

  cambiarEstadoSoporte(estado) {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var cambiar_a =  (!estado) ? 0 : 1;

    var data = new FormData();
    data.append('id_usuario', this.state.usuario.id_usuario);
    data.append('estado', cambiar_a);
    data.append('_usuario' , this.props._usuario);
    data.append('username' , this.props.usuario_ficha.username);

    http._POST(Server + 'configuracion/usuario.php?accion=cambiar_estado_soporte', data).then((res) => {
        if (res !== 'error') {
          this.setState({ cargando: false });
          this.cargarUsuario();
          this.props.getUsuarios();
        } else {
          message.error("Error al actualizar estado.");
          this.setState({ cargando: false });
        }
      }).catch((err) => {
        message.error("Error al actualizar estado." + err);
        this.setState({ cargando: false });
      });
  }

  cambiarEstadoUsuario(estado) {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var cambiar_a =  (!estado) ? 0 : 1;

    var data = new FormData();
    data.append('id_usuario', this.state.usuario.id_usuario);
    data.append('estado', cambiar_a);    
    data.append('_usuario', this.props._usuario);

    http._POST(Server + 'configuracion/usuario.php?accion=cambiar_estado' , data).then((res) => {
        if (res !== 'error') {
          this.setState({ cargando: false });
          this.cargarUsuario();
          this.props.getUsuarios();
        } else {
          message.error("Error al actualizar puestos.");
          this.setState({ cargando: false });
        }
      }).catch((err) => {
        message.error("Error al actualizar puestos." + err);
        this.setState({ cargando: false });
      });
  }

  getTicketsAll() {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    http._GET(Server + 'configuracion/ticket.php?accion=get_tickets_all').then((res) => {
        if (res !== 'error') {
          let resultado = [];
          for (const objecto of res) {
            resultado.push(
              {
                categoria: objecto.categoria,
                id_categoria: objecto.id_categoria,
                sub_categoria: objecto.sub_categoria,
                id_sub_categoria: objecto.id_sub_categoria,
                id_ticket: objecto.id_ticket,
                nombre_ticket: objecto.nombre_ticket,
                descripcion: objecto.descripcion,
                tiempo_estimado: objecto.tiempo_estimado,
                prioridad_recomendada: objecto.prioridad_recomendada,
                estado: objecto.estado,
                creacion: objecto.creacion,
                procedimiento: objecto.procedimiento,
                estado_final: JSON.parse(objecto.estado_final)
              }
            )
          }

          var group1 = _.groupBy(resultado, (b) => b.categoria)
          var llaves = Object.keys(group1)
          let agrupado_final = [];

          var i = 0
          while (i < llaves.length) {
            let index = llaves[i]
            var grupito = _.groupBy(group1[llaves[i]], (b) => b.sub_categoria)
            agrupado_final.push(
              { [index]: [grupito] }
            )
            i++;
          }
          this.setState({ tickets_all: agrupado_final });
          this.setState({ cargando: false });
        } else {
          message.error("Error al cargar Categorías.");
          this.setState({ cargando: false })
        }
      }).catch((err) => {
        message.error("Error al cargar Categorías." + err);
        this.setState({ cargando: false });
      });
  }

  cargarUsuario() {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var data = new FormData();
    data.append('id_usuario', this.props.usuario_ficha.id_usuario);

    http._POST(Server + 'configuracion/usuario.php?accion=one', data).then((res) => {
        if (res !== 'error') {
          this.setState({ usuario: res });
          this.setState({ cargando: false });
        } else {
          message.error("Error al cargar Departamento.");
          this.setState({ cargando: false });
        }
      }).catch((err) => {
        message.error("Error al cargar Departamento." + err);
        this.setState({ cargando: false });
      });
  }

  nest(seq, keys) {
    if (!keys.length)
      return seq;
    var first = keys[0];
    var rest = keys.slice(1);
    return _.mapValues(_.groupBy(seq, first), function (value) {
      return this.nest(value, rest);
    });
  }
}

class PerfilPermisos extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cargando: false,
      perfiles: undefined
    }
  }

  componentDidMount() {
    this.getPerfilUsuario();
  }

  render() {
    const { perfiles } = this.state;
    const { _usuario , Server , id_usuario } = this.props;
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%' }}>
        {perfiles &&
          <Tabs
            defaultActiveKey={perfiles !== undefined ? perfiles[0].id_puesto : undefined}
            tabPosition={"left"}
          >
            {perfiles.map((item) => (
              <TabPane tab={item.puesto} key={item.id_puesto}>
                <PerfilUsuario _usuario={_usuario} Server={Server} puesto={item} id_usuario={id_usuario} />
              </TabPane>
            ))}
          </Tabs>
        }
        {!perfiles &&
          <label style={{ textAlign: 'center' }}>No es posible que un usuario sin modulos asignados pueda ingresar al sistema.</label>
        }
      </div>
    )
  }

  getPerfilUsuario() {
    const { Server, id_usuario } = this.props;
    http._GET(Server + "configuracion/usuario.php?accion=get_perfil_usuario&id_usuario=" + id_usuario).then(res => {
      if (res["err"] == "false") {
        this.setState({
          perfiles: res['perfiles']
        });
      } else {
        message.info("no se encontro informacion");
      }
      this.setState({ cargando: false });
    }).catch(err => {
      message.error("Error al obtener permisos del usuario." + err);
      this.setState({ cargando: false });
    });
  }
}

class PerfilTickets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cargando: false,
      usuario_asignaciones: undefined,
    }
  }

  componentDidMount() {
    this.getAsignaciones()
  }

  render() {
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%' }}>
        {this.state.usuario_asignaciones &&
          <Tabs
            defaultActiveKey={this.state.usuario_asignaciones !== undefined ? this.state.usuario_asignaciones[0].id_cargo.toString() : undefined}
            tabPosition={"left"}
          >
            {this.state.usuario_asignaciones.map((item) => (
              <TabPane tab={item.puesto + ' en ' + item.departamento} key={item.id_cargo}>
                <TicketsAsignacion item={item} _usuario={this.props._usuario} Server={this.props.Server} id_puesto={item.id_puesto} id_cargo={item.id_cargo} id_usuario={item.id_usuario} tickets_all={this.props.tickets_all} />
              </TabPane>
            ))}
          </Tabs>
        }
        {!this.state.usuario_asignaciones &&
          <label style={{ textAlign: 'center' }}>No es posible que un usuario sin asginación cree tickets.</label>
        }
      </div>
    )
  }

  getAsignaciones() {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    var data = new FormData();
    data.append('id_usuario', this.props.id_usuario);

    http._POST(Server + 'configuracion/usuario.php?accion=get_asignaciones_one', data).then(res => {
      if (res !== 'error') {
        if (res.length > 0) {
          this.setState({ usuario_asignaciones: res });
        } else {
          this.props.moveraSoporte();
        }
        this.setState({ cargando: false });
      } else {
        message.error("Error al obtener asignaciones.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al obtener asignaciones." + err);
      this.setState({ cargando: false });
    });
  }

  tiene_letras(texto) {
    var letras = "abcdefghyjklmnñopqrstuvwxyz";
    texto = texto.toLowerCase();
    for (var i = 0; i < texto.length; i++) {
      if (letras.indexOf(texto.charAt(i), 0) !== -1) {
        return true;
      }
    }
    return false;
  }
}

class PerfilTicketsSoporte extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cargando: false,
      usuario_asignaciones: undefined,
    }
  }

  componentDidMount() {
    this.getAsignaciones()
  }

  render() {
    const { usuario , Server , _usuario , id_usuario , tickets_all } = this.props;
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%' }}>
        {this.state.usuario_asignaciones &&
          <Tabs
            defaultActiveKey={"0"}
            tabPosition={"left"}
          >
            <TabPane tab={"GLOBAL"} key={"0"}>
              <TicketsSoporte _usuario={_usuario} tipo={'global'} usuario={usuario} Server={Server} id_puesto={0} id_cargo={0} id_usuario={id_usuario} tickets_all={tickets_all} />
            </TabPane>
            {this.state.usuario_asignaciones.map((item) => (
              <TabPane tab={item.puesto + ' en ' + item.departamento} key={item.id_cargo}>
                <TicketsSoporte  _usuario={_usuario} tipo={'asignacion'} soporte={item.soporte} usuario={usuario} item={item} Server={Server} id_puesto={item.id_puesto} id_cargo={item.id_cargo} id_usuario={item.id_usuario} tickets_all={tickets_all} />
              </TabPane>
            ))}
          </Tabs>
        }
      </div>
    )
  }

  getAsignaciones() {

    let Server = String(this.props.Server)
    this.setState({ cargando: true })
    var data = new FormData();
    data.append('id_usuario', this.props.id_usuario);

    http._POST(Server + 'configuracion/usuario.php?accion=get_asignaciones_one', data).then(res => {
      if (res !== 'error') {
        this.setState({ cargando: false, usuario_asignaciones: res })
      } else {
        message.error("Error al obtener asignaciones.");
        this.setState({ cargando: false })
      }
    }).catch(err => {
      message.error("Error al obtener asignaciones." + err);
      this.setState({ cargando: false })
    });
  }

  tiene_letras(texto) {
    var letras = "abcdefghyjklmnñopqrstuvwxyz";
    texto = texto.toLowerCase();
    for (var i = 0; i < texto.length; i++) {
      if (letras.indexOf(texto.charAt(i), 0) !== -1) {
        return true;
      }
    }
    return false;
  }
}

class Historial extends Component {

  constructor(props) {
    super(props);
    this.state = {
      historial: []
    };
  }

  componentDidMount() {
    this.getHistorial();
  }

  render() {
    const { historial } = this.state;
    return (
      <div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
          <h2 style={{ display: 'flex', flex: 1, justifyContent: 'center', }}>
              Historial
          </h2>
      </div>
      { historial.length > 0 ?
        <div
            className="ag-theme-balham"
            style={{
                height: '300px',
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
                rowData={historial}>
                <AgGridColumn headerName="Detalle" field={"accion"} />
                <AgGridColumn headerName="Fecha" width={60} field="creacion" />              
            </AgGridReact>
        </div>
      : 
        <div style={{ textAlign: 'center' , padding: 10}}>
           <label>El usuario no a realizadon ningun cambio en el sistema.</label>
        </div>
      }
  </div>
    )
  }

  getHistorial() {
    const { id_usuario, Server } = this.props;
    http._GET(Server + "configuracion/usuario.php?accion=get_historial&id_usuario=" + id_usuario).then(res => {
      this.setState({ historial: res });
    }).catch(err => {
      message.error("Error al obtener asignaciones." + err);
      this.setState({ cargando: false })
    });
  }
}

export default ver_puesto;