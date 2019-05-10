import React, { Component } from 'react';

//import _ from 'lodash';
import { Icon, Tree, Layout, Form, Tooltip, message, Button, Switch } from 'antd';
import http from '../../services/http.services';

const TreeNode = Tree.TreeNode;

class tickets_soporte extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frm_activo_aplicar_todos: true,
      tickets_seleccionadas: undefined,
      expanded: false,
      cargando: false,
      cambios: false,
      actualizar: false,
    }
  }

  componentDidMount() {
    this.getTicketsSoporte()
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '300px' }}>
        <Layout style={{ height: '100%', width: '100%', overflowY: 'auto', backgroundColor: 'white' }}>
          <h4>Tickets permitidas:</h4>
          {this.state.tickets_seleccionadas !== undefined ?
            <Tree
              checkable
              multiple
              checkedKeys={this.state.tickets_seleccionadas}
              defaultCheckedKeys={this.state.tickets_seleccionadas}
              defaultExpandedKeys={this.state.tickets_seleccionadas}
              onCheck={this.onCheck}
            >
              {Object.values(this.props.tickets_all).map((item, index) => (
                <TreeNode title={Object.keys(item)} key={"cat" + Object.keys(item) + index} selectable={false} >
                  {Object.entries(item[Object.keys(item)][0]).map((item, index) => (
                    <TreeNode title={item[0]} key={"sub_cat" + item[0] + index} selectable={false} >
                      {Object.entries(item[1]).map((item, index) => (
                        <TreeNode title={item[1].nombre_ticket} key={item[1].id_ticket} selectable={false} />
                      ))}
                    </TreeNode>
                  ))}
                </TreeNode>
              ))}
            </Tree>
            :
            <Layout style={{ height: '100%', width: '100%', overflowY: 'auto', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
              Cargando tickets...
            </Layout>
          }
        </Layout>
        <div style={{ display: 'flex', flexDirection: 'row', height: '10%', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ alignItems: 'center', justifyContent: 'center', marginRight: 20 }}>
            {this.props.tipo === 'puesto' &&
              <span>
                Actualizar Puestos de Usuarios&nbsp;
                <Tooltip title="Se actualizará el perfil en cada asignación del puesto. Ello implica reemplazar el perfil anterior por el nuevo.">
                  <Icon type="question-circle-o" />
                </Tooltip> &nbsp;
              </span>
            }
            {this.props.tipo === 'global' &&
              <span>
                Actualizar Usuarios&nbsp;
                <Tooltip title="Se agregarán tickets de soporte globales a usuarios. El perfil existente no será reemplazado en cada usuario, sólo se agregarán tickets no existentes.">
                  <Icon type="question-circle-o" />
                </Tooltip> &nbsp;
              </span>
            }
            <Switch size="small" defaultChecked={this.state.actualizar} onChange={(valor) => { this.setState({ actualizar: valor, cambios: true }) }} />
          </div>
          <Button onClick={this.guardarPerfilTicketsSoporte.bind(this)} disabled={!this.state.cambios} type="primary" htmlType="button" style={{ display: 'flex', marginRight: 30, width: '40%', height: '90%', justifyContent: 'center' }}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    )
  }

  onCheck = (checkedKeys, info) => {
    let resultado = [];
    for (const objecto of checkedKeys) {
      if (!this.tiene_letras(objecto)) {
        resultado.push(
          objecto
        )
      }
    }
    this.setState({ tickets_seleccionadas: resultado, cambios: true })
  }

  guardarPerfilTicketsSoporte() {
    let Server = String(this.props.Server)
    this.setState({ cargando: true, cambios: false })
    var actualizar = ( this.state.actualizar == true ) ? 1 : 0;

    var data = new FormData();
    data.append('id_puesto', this.props.id_puesto);
    data.append('perfil', JSON.stringify(this.state.tickets_seleccionadas));
    data.append('tipo', this.props.tipo);
    data.append('actualizar', actualizar);
    data.append('_usuario' , this.props._usuario);

    http._POST(Server + 'configuracion/puesto.php?accion=guardar_perfil_tickets_soporte', data).then(res => {
      if (res !== 'error') {
        this.setState({ cargando: false, cambios: false });
        message.info("Perfil de puesto actualizado correctamente.");
      } else {
        message.error("Error al actualizar.");
        this.setState({ cargando: false, cambios: true })
      }
    }).catch(err => {
      message.error("Error al actualizar." + err);
      this.setState({ cargando: false, cambios: true })
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

  getTicketsSoporte() {
    let Server = String(this.props.Server);
    var data = new FormData();
    data.append('id_puesto', this.props.id_puesto);
    data.append('tipo', this.props.tipo);

    this.setState({ cargando: true });
    http._POST(Server + 'configuracion/puesto.php?accion=get_tickets_soporte', data).then(res => {
      if (res !== 'error') {
        let resultado = [];
        for (const objecto of res) {
          resultado.push(
            objecto.id_ticket
          )
        }
        setTimeout(() => {
          this.setState({ tickets_seleccionadas: resultado });
        }, 500)
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Tickets.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Tickets." + err);
      this.setState({ cargando: false })
    });
  }
}

export default Form.create()(tickets_soporte);