import React, { Component } from 'react';
import { AsyncStorage } from 'AsyncStorage';
import { Router, Route, Link } from "react-router-dom";

import { PropagateLoader } from 'react-spinners';
import InicioView from "../src/inicio/inicio";
import CalendarioView from "../src/calendario/calendario";
import PerfilView from "../src/perfil/perfil";

import DepartamentosView from "../src/configuracion/departamentos";
import PuestosView from "../src/configuracion/puestos";
import TicketsView from "../src/configuracion/tickets";
import UsuariosView from "../src/configuracion/usuarios_permisos";

import LoginView from './Login/login.component';
import DashboadView from './dashboard/dashboard.componen';

import createHistory from 'history/createBrowserHistory';
import { Menu, Icon, Tooltip, message, Button } from 'antd';

import http from './services/http.services';

const SubMenu = Menu.SubMenu;
const history = createHistory();
const Server = "http://localhost:8082/tickets/";
const imageUrl = require('../src/media/fondo.jpg');

class App extends Component {
  constructor() {
    super();
    this.state = {
      showMenu: false,
      pathname: '',
      session_id: undefined,
    }
  }

  componentWillMount() {
    this.setState({ pathname: history.location.pathname });
  }

  componentDidMount() {
    this.comprobarSesion();
  }

  render() {

    const { session_id, pathname, cargando } = this.state;
    return (
      <Router history={history}>
        <div style={{ display: "flex", width: "100%", height: "100vh" }} >
          {(session_id) &&
            <div style={{ display: "flex", width: "100%", height: "100%" }} >
              <div style={{ width: "20%", height: "100%", background: "white" }}>
                <Menu mode="inline" selectedKeys={[pathname]} openKeys={['5']} style={{ height: '100%' }} >
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
                  <Menu.Item key="/"><Link to="" onClick={() => { this.setState({ pathname: "/" }) }}><Icon type="dashboard" />Dashboard</Link></Menu.Item>
                  <Menu.Item key="/inicio"><Link to="/inicio" onClick={() => { this.setState({ pathname: "/inicio" }) }}><Icon type="home" />Inicio</Link></Menu.Item>
                  <Menu.Item key="/calendario"><Link to="/calendario" onClick={() => { this.setState({ pathname: "/calendario" }) }}><Icon type="calendar" />Calendario</Link></Menu.Item>
                  <Menu.Item key="/perfil"><Link to="/perfil" onClick={() => { this.setState({ pathname: "/perfil" }) }}><Icon type="smile" />Perfil</Link></Menu.Item>
                  <SubMenu key="5" title={<span><Icon type="setting" /><span>Configuración</span></span>}>
                    <Menu.Item key="/configuracion/usuarios">
                      <Link to="/configuracion/usuarios" onClick={() => { this.setState({ pathname: "/configuracion/usuarios" }) }}>
                        <Icon type="user" />Usuarios y Permisos
                   </Link>
                    </Menu.Item>
                    <Menu.Item key="/configuracion/tickets">
                      <Link to="/configuracion/tickets" onClick={() => { this.setState({ pathname: "/configuracion/tickets" }) }}>
                        <Icon type="tag" />Tickets
                   </Link>
                    </Menu.Item>
                    <Menu.Item key="/configuracion/departamentos">
                      <Link to="/configuracion/departamentos" onClick={() => { this.setState({ pathname: "/configuracion/departamentos" }) }}>
                        <Icon type="build" />Departamentos
                   </Link>
                    </Menu.Item>
                    <Menu.Item key="/configuracion/puestos">
                      <Link to="/configuracion/puestos" onClick={() => { this.setState({ pathname: "/configuracion/puestos" }) }}>
                        <Icon type="profile" />Puestos
                   </Link>
                    </Menu.Item>
                  </SubMenu>
                </Menu>
              </div>
              <div style={{ display: 'flex', flex: 1, width: "80%", height: "100%" }}>

                {pathname == '/' &&
                  <DashboadView Server={Server} />
                }

                <Route path="/inicio" render={() => <InicioView Server={Server} />} />
                <Route path="/configuracion/departamentos" render={() => <DepartamentosView Server={Server} />} />
                <Route path="/configuracion/puestos" render={() => <PuestosView Server={Server} />} />
                <Route path="/configuracion/tickets" render={() => <TicketsView Server={Server} />} />
                <Route path="/configuracion/usuarios" render={() => <UsuariosView Server={Server} />} />
                <Route path="/calendario" render={() => <CalendarioView Server={Server} />} />
                <Route path="/perfil" render={() => <PerfilView Server={Server} />} />
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
      </Router>
    );
  }

  levantamosSesion(responseJson) {
    AsyncStorage.setItem("session_id", responseJson);
    this.setState({ session_id: responseJson });
  }

  async comprobarSesion() {
    this.setState({ cargando: true })
    var session_id = await AsyncStorage.getItem("session_id")

    var data = new FormData();
    data.append('session_id', session_id);

    http._POST(Server + 'acceso/sesion_check.php', data).then((res) => {
      if (res === 'nosesion') {
        this.setState({ session_id: undefined })
      } else if (res) {
        this.setState({ session_id: res })
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
      this.comprobarSesion()
      this.setState({ cargando: false })
    }).catch(err => {
      message.error("Ha ocurrido un error: " + err);
      this.setState({ cargando: false })
    });
  }
}

export default App;