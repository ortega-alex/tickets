import React, { Component } from 'react';

//import _ from 'lodash';
import { Icon, Tree, Layout, Form, Tooltip, message, Button } from 'antd';
import http from '../../services/http.services';

const TreeNode = Tree.TreeNode;

class tickets_asignacion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frm_activo_aplicar_todos: true,
      tickets_seleccionadas: undefined,
      expanded: false,
      cargando: false,
      cambios: false,
    }
  }

  componentDidMount() {
    this.getTicketsAsignacion()
  }

  render() {
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '320px' }}>
        <Layout style={{ height: '100%', width: '100%', overflowY: 'auto', backgroundColor: 'white', padding: '10px', marginLeft: 40 }}>
          <h4>Tickets permitidas:</h4>
          {this.state.tickets_seleccionadas !== undefined ?
            <Layout style={{ height: '100%', width: '100%', overflowY: 'auto', backgroundColor: 'white' }}>
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
            </Layout>
            :
            <Layout style={{ height: '100%', width: '100%', overflowY: 'auto', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
              Cargando tickets...
                </Layout>
          }
        </Layout>
        <div style={{ display: 'flex', flexDirection: 'row', height: '10%', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'row', fontSize: 10, textAlign: 'center' }}>
            {(parseInt(this.props.item.limitar_tickets) === 1) &&
              <div>
                <span>
                  Únicamente podrá hacer uso de las tickets seleccionadas.&nbsp;
                  <Tooltip title="Se ha limitado el uso de tickets a las tickets seleccionadas. Si deseas habilitar el uso de otras tickets desactiva Limitar Tickets en la configiuración de este puesto.">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              </div>
            }
            {(parseInt(this.props.item.limitar_tickets) === 0) &&
              <div>
                <span>
                  Se le mostrarán primero las tickets seleccionadas.&nbsp;
                  <Tooltip title="El usuario verá las tickets seleccionadas en primer plano, pero podrá navegar entre el resto de tickets del sistema.">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              </div>
            }
          </div>
          <Button onClick={this.guardarPerfilTicketsAsignacion.bind(this)} disabled={!this.state.cambios} type="primary" htmlType="button" style={{ display: 'flex', marginRight: 30, width: '40%', height: '90%', justifyContent: 'center' }}>
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
    this.setState({ tickets_seleccionadas: resultado, cambios: true });
  }

  guardarPerfilTicketsAsignacion() {
    const { Server , _usuario , item , id_cargo , id_puesto} = this.props;
    this.setState({ cargando: true, cambios: false });

    var data = new FormData();
    data.append('id_cargo', id_cargo);
    data.append('id_puesto', id_puesto);
    data.append('perfil', JSON.stringify(this.state.tickets_seleccionadas));
    data.append('_usuario' , _usuario);
    data.append('item' , JSON.stringify(item));

    http._POST(Server + 'configuracion/usuario.php?accion=guardar_perfil_tickets_cargo', data).then(res => {
      if (res !== 'error') {
        this.setState({ cargando: false, cambios: false });
        message.info("Perfil de puesto actualizado correctamente.");
      } else {
        message.error("Error al actualizar.");
        this.setState({ cargando: false, cambios: true });
      }
    }).catch(err => {
      message.error("Error al actualizar." + err);
      this.setState({ cargando: false, cambios: true });
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

  getTicketsAsignacion() {
    let Server = String(this.props.Server);

    var data = new FormData();
    data.append('id_cargo', this.props.id_cargo);

    this.setState({ cargando: true });

    http._POST(Server + 'configuracion/usuario.php?accion=get_tickets_asignacion', data).then(res => {
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
      this.setState({ cargando: false });
    });
  }
}

export default Form.create()(tickets_asignacion);