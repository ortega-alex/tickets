import React, { Component } from 'react';
import { AsyncStorage } from 'AsyncStorage';
import { HashRouter, Route, Link } from "react-router-dom";

import { PropagateLoader } from 'react-spinners';
import InicioView from "../src/inicio/inicio";
import CalendarioView from "../src/calendario/calendario";

import DepartamentosView from "../src/configuracion/departamentos";
import PuestosView from "../src/configuracion/puestos";
import TicketsView from "../src/configuracion/tickets";
import UsuariosView from "../src/configuracion/usuarios_permisos";

import LoginView from './Login/login.component';
import DashboadView from './dashboard/dashboard.componen';

import { Menu, Icon, Tooltip, message, Button } from 'antd';

import http from './services/http.services';
import { initializeFirebase } from './push-notification';

const imageUrl = require('../src/media/fondo.jpg');
const SubMenu = Menu.SubMenu;

//const Server = "http://172.29.9.186:8082/tickets/";
//const Server = "https://172.29.11.26/dev/tickets/api/";

var url = (window.location.href);
const Server = url.split("#")[0]+"api/";

class App extends Component {
  constructor() {
    super();
    this.state = {
      showMenu: false,
      pathname: '',
      session_id: undefined,
      _usuario: undefined,
      accesos: {},
      modulos: {},
      departamentos: [],
      rol: null,
      soporte: null
    }
  }

  componentWillMount() {
    this.setState({ pathname: '/' });
  }

  componentDidMount() {
    this.comprobarSesion();
  }

  render() {

    const { session_id, pathname, cargando, _usuario, accesos, modulos, departamentos, rol, soporte } = this.state;
    return (
      <HashRouter>
        <div style={{ display: "flex", width: "100%", height: "100vh" }} >
          {(session_id) &&
            <div style={{ display: "flex", width: "100%", height: "100%" }} >
              <div style={{ width: "20%", height: "100%", background: "white" }}>
                <Menu
                  mode="inline"
                  defaultSelectedKeys={["pathname"]}
                  style={{ height: '100%' }}
                >
                  <Menu.Item key="0">
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'row', padding: '10px', textAlign: 'left' }}>
                      <h3>Menú Principal</h3>
                      <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Cerrar Sesión">
                          <Button disabled={cargando} type="primary" onClick={() => { this.cerrarSession() }}>
                            <Icon type="logout" />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  </Menu.Item>
                  {
                    modulos['Indicadores'] &&
                    <Menu.Item key="/"><Link to="" onClick={() => { this.setState({ pathname: "/" }) }}><Icon type="dashboard" />Indicadores</Link></Menu.Item>
                  }
                  {
                    modulos['Inicio'] &&
                    <Menu.Item key="/inicio"><Link to="/inicio" onClick={() => { this.setState({ pathname: "/inicio" }) }}><Icon type="home" />Mis Tickets</Link></Menu.Item>
                  }
                  {
                    (modulos['Calendario'] && soporte == 1) &&
                    <Menu.Item key="/calendario"><Link to="/calendario" onClick={() => { this.setState({ pathname: "/calendario" }) }}><Icon type="calendar" />Tickets Programados</Link></Menu.Item>
                  }
                  { ( modulos['Configuracion_Usuarios'] || modulos['Configuracion_Tickets'] ||
                      modulos['Configuracion_Departamentos'] || modulos['Configuracion_Puestos'] ) &&
                    <SubMenu key="5" title={<span><Icon type="setting" /><span>Configuración</span></span>}>
                      {
                        modulos['Configuracion_Usuarios'] &&
                        <Menu.Item key="/configuracion/usuarios">
                          <Link to="/configuracion/usuarios" onClick={() => { this.setState({ pathname: "/configuracion/usuarios" }) }}>
                            <Icon type="user" />Usuarios y Permisos
                          </Link>
                        </Menu.Item>
                      }
                      {modulos['Configuracion_Tickets'] &&
                        <Menu.Item key="/configuracion/tickets">
                          <Link to="/configuracion/tickets" onClick={() => { this.setState({ pathname: "/configuracion/tickets" }) }}>
                            <Icon type="tag" />Categoria De Tickets
                          </Link>
                        </Menu.Item>
                      }
                      {modulos['Configuracion_Departamentos'] &&
                        <Menu.Item key="/configuracion/departamentos">
                          <Link to="/configuracion/departamentos" onClick={() => { this.setState({ pathname: "/configuracion/departamentos" }) }}>
                            <Icon type="build" />Departamentos
                          </Link>
                        </Menu.Item>
                      }
                      {modulos['Configuracion_Puestos'] &&
                        <Menu.Item key="/configuracion/puestos">
                          <Link to="/configuracion/puestos" onClick={() => { this.setState({ pathname: "/configuracion/puestos" }) }}>
                            <Icon type="profile" />Perfiles
                          </Link>
                        </Menu.Item>
                      }
                    </SubMenu>
                  }
                </Menu>
              </div>
              <div style={{ display: 'flex', flex: 1, width: "80%", height: "100%" }}>
                <Route path="/" exact render={() =>
                  <DashboadView Server={Server} _usuario={_usuario} accesos={accesos} departamentos={departamentos} rol={rol} />
                } />
                <Route path="/inicio" exact render={() => 
                  <InicioView Server={Server} _usuario={_usuario} accesos={accesos} rol={rol} />
                } />
                <Route path="/inicio/:ticket" render={(req) => 
                  <InicioView Server={Server} _usuario={_usuario} accesos={accesos} rol={rol} req={req} />
                } />
                <Route path="/configuracion/departamentos" render={() => 
                  <DepartamentosView Server={Server} _usuario={_usuario} accesos={accesos} rol={rol} />
                } />
                <Route path="/configuracion/puestos" render={() => 
                  <PuestosView Server={Server} _usuario={_usuario} accesos={accesos} rol={rol} />
                } />
                <Route path="/configuracion/tickets" render={() => 
                  <TicketsView Server={Server} _usuario={_usuario} accesos={accesos} rol={rol} />
                } />
                <Route path="/configuracion/usuarios" render={() => 
                  <UsuariosView Server={Server} _usuario={_usuario} accesos={accesos} rol={rol} />
                } />
                <Route path="/calendario" render={() => 
                  <CalendarioView Server={Server} _usuario={_usuario} accesos={accesos} rol={rol} />
                } />
              </div>
            </div>
          }

          {(!this.state.session_id) &&
            <div style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              overflow: 'hidden'
            }} >
              {(!this.state.cargando) &&
                <LoginView Server={Server} levantamosSesion={this.levantamosSesion.bind(this)} />
              }
              {(this.state.cargando) &&
                <PropagateLoader
                  sizeUnit={"px"}
                  size={15}
                  color={'#F4D03F'}
                />
              }
            </div>
          }
        </div>
      </HashRouter>
    );
  }

  levantamosSesion(responseJson) {
    AsyncStorage.setItem("session_id", responseJson["session_id"]);
    this.setState({
      session_id: responseJson["session_id"],
      _usuario: responseJson["id_usuario"],
      accesos: responseJson['accesos'],
      modulos: responseJson['modulos'],
      departamentos: responseJson['departamentos'],
      rol: responseJson['id_rol'],
      soporte: responseJson['soporte']
    });
  }

  async comprobarSesion() {
    this.setState({ cargando: true });
    var session_id = await AsyncStorage.getItem("session_id");

    var data = new FormData();
    data.append('session_id', session_id);

    http._POST(Server + 'acceso/sesion_check.php', data).then((res) => {
      if (res == 'nosesion') {
        this.setState({
          session_id: undefined,
          _usuario: undefined
        });
      } else if (res) {
        this.setState({
          session_id: res,
          _usuario: res["id_usuario"],
          accesos: res['accesos'],
          modulos: res['modulos'],
          departamentos: res['departamentos'],
          rol: res['id_rol'],
          soporte: res['soporte'],
          session_id: session_id
        });
        initializeFirebase(res["id_usuario"], Server);
      }
      this.setState({ cargando: false });
    }).catch(err => {
      message.error("Ha ocurrido un error: " + err);
      this.setState({ cargando: false });
    });
  }

  async cerrarSession() {
    this.setState({ cargando: true });
    var session_id = await AsyncStorage.getItem("session_id");
    var data = new FormData();
    data.append('session_id', session_id);

    http._POST(Server + 'acceso/cerrar_session.php', data).then(() => {
      AsyncStorage.setItem("session_id", undefined);
      this.comprobarSesion();
      this.setState({ cargando: false });
    }).catch(err => {
      message.error("Ha ocurrido un error: " + err);
      this.setState({ cargando: false });
    });
  }
}

export default App;