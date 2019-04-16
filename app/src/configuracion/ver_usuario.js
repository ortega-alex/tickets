import React, { Component } from 'react';

import TicketsAsignacion from "../configuracion/forms/tickets_asignacion";
import TicketsSoporte from "../configuracion/forms/tickets_soporte";
import _ from 'lodash';
import { Icon, Form, Tabs, Tooltip, message, Switch } from 'antd';

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
    const { id_usuario, Server } = this.props;
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
                <TabPane tab="Tickets" key="1"><PerfilTickets moveraSoporte={this.moveraSoporte.bind(this)} id_usuario={id_usuario} tickets_all={tickets_all} Server={Server} /></TabPane>
              }
              <TabPane tab="Historial" key="2">Historial de Tickets</TabPane>
              <TabPane tab="Módulos" key="3"><PerfilPermisos /></TabPane>
              {(parseInt(this.state.usuario.soporte) === 1) &&
                <TabPane tab="Soporte" key="4"><PerfilTicketsSoporte usuario={usuario} id_usuario={id_usuario} tickets_all={tickets_all} Server={this.props.Server} /></TabPane>
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
        this.setState({ active_tab: 4 })
      }, 1000);
    }
  }

  cambiarEstadoSoporte(estado) {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var cambiar_a = 1;

    if (!estado) {
      cambiar_a = 0
    }

    var data = new FormData();
    data.append('id_usuario', this.state.usuario.id_usuario);
    data.append('estado', cambiar_a);

    fetch(Server + 'configuracion/usuario.php?accion=cambiar_estado_soporte', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: data
    })
      .then((response) => response.json())
      .then((responseJson) => {

        if (responseJson !== 'error') {
          this.setState({ cargando: false })
          this.cargarUsuario()
          this.props.getUsuarios()
        } else {
          message.error("Error al actualizar estado.");
          this.setState({ cargando: false })
        }
      })
      .catch((error) => {
        message.error("Error al actualizar estado." + error);
        this.setState({ cargando: false })
      });
  }

  cambiarEstadoUsuario(estado) {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var cambiar_a = 1;

    if (!estado) {
      cambiar_a = 0
    }

    var data = new FormData();
    data.append('id_usuario', this.state.usuario.id_usuario);
    data.append('estado', cambiar_a);

    fetch(Server + 'configuracion/usuario.php?accion=cambiar_estado', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: data
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson !== 'error') {
          this.setState({ cargando: false })
          this.cargarUsuario()
          this.props.getUsuarios()
        } else {
          message.error("Error al actualizar puestos.");
          this.setState({ cargando: false })
        }
      })
      .catch((error) => {
        message.error("Error al actualizar puestos." + error);
        this.setState({ cargando: false })
      });
  }

  getTicketsAll() {
    let Server = String(this.props.Server)
    this.setState({ cargando: true })

    fetch(Server + 'configuracion/ticket.php?accion=get_tickets_all', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {

        if (responseJson !== 'error') {
          let resultado = [];
          for (const objecto of responseJson) {
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
          this.setState({ tickets_all: agrupado_final })
          this.setState({ cargando: false })
        } else {
          message.error("Error al cargar Categorías.");
          this.setState({ cargando: false })
        }
      })
      .catch((error) => {
        message.error("Error al cargar Categorías." + error);
        this.setState({ cargando: false })
      });
  }

  cargarUsuario() {

    let Server = String(this.props.Server);
    this.setState({ cargando: true });
    var data = new FormData();
    data.append('id_usuario', this.props.usuario_ficha.id_usuario);

    fetch(Server + 'configuracion/usuario.php?accion=one', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: data
    })
      .then((response) => response.json())
      .then((responseJson) => {

        if (responseJson !== 'error') {
          this.setState({ usuario: responseJson });
          this.setState({ cargando: false });
        } else {
          message.error("Error al cargar Departamento.");
          this.setState({ cargando: false });
        }
      })
      .catch((error) => {
        message.error("Error al cargar Departamento." + error);
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

  render() {
    return (
      <div>
        Perfil de permisos (módulos del sistema).
     </div>
    )
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
            {this.state.usuario_asignaciones.map((item, index) => (
              <TabPane tab={item.puesto + ' en ' + item.departamento} key={item.id_cargo}><TicketsAsignacion item={item} Server={this.props.Server} id_puesto={item.id_puesto} id_cargo={item.id_cargo} id_usuario={item.id_usuario} tickets_all={this.props.tickets_all} /></TabPane>
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

    let Server = String(this.props.Server)
    this.setState({ cargando: true })
    var data = new FormData();
    data.append('id_usuario', this.props.id_usuario);

    fetch(Server + 'configuracion/usuario.php?accion=get_asignaciones_one', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: data
    })
      .then((response) => response.json())
      .then((responseJson) => {

        if (responseJson !== 'error') {
          if (responseJson.length > 0) {
            this.setState({ usuario_asignaciones: responseJson })
          } else {
            this.props.moveraSoporte()
          }
          this.setState({ cargando: false })
        } else {
          message.error("Error al obtener asignaciones.");
          this.setState({ cargando: false })
        }
      })
      .catch((error) => {
        message.error("Error al obtener asignaciones." + error);
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

    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%' }}>
        {this.state.usuario_asignaciones &&
          <Tabs
            defaultActiveKey={"0"}
            tabPosition={"left"}
          >
            <TabPane tab={"GLOBAL"} key={"0"}><TicketsSoporte tipo={'global'} usuario={this.props.usuario} Server={this.props.Server} id_puesto={0} id_cargo={0} id_usuario={this.props.id_usuario} tickets_all={this.props.tickets_all} /></TabPane>
            {this.state.usuario_asignaciones.map((item, index) => (
              <TabPane tab={item.puesto + ' en ' + item.departamento} key={item.id_cargo}><TicketsSoporte tipo={'asignacion'} soporte={item.soporte} usuario={this.props.usuario} item={item} Server={this.props.Server} id_puesto={item.id_puesto} id_cargo={item.id_cargo} id_usuario={item.id_usuario} tickets_all={this.props.tickets_all} /></TabPane>
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

    fetch(Server + 'configuracion/usuario.php?accion=get_asignaciones_one', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: data
    })
      .then((response) => response.json())
      .then((responseJson) => {

        if (responseJson !== 'error') {
          this.setState({ cargando: false, usuario_asignaciones: responseJson })
        } else {
          message.error("Error al obtener asignaciones.");
          this.setState({ cargando: false })
        }
      })
      .catch((error) => {
        message.error("Error al obtener asignaciones." + error);
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

export default ver_puesto;