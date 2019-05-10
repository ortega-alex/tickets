import React, { Component } from 'react';

import { Icon, Tree, Layout, Form, Tooltip, message, Button } from 'antd';
import http from '../../services/http.services';

const TreeNode = Tree.TreeNode;

class PerfilUsuario extends Component {
    constructor(props) {
        super(props);
        this.state = {
            perfil_permisos: [],
            activos: undefined,
            cargando: false,
            cambios: false
        }
    }

    componentDidMount() {
        this.getPerfilPermisosUsuario();
    }

    render() {
        const { perfil_permisos, activos } = this.state;
        return (
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '320px' }}>
                <Layout style={{ height: '100%', width: '100%', overflowY: 'auto', backgroundColor: 'white', padding: '10px', marginLeft: 40 }}>
                    <h4>modulos permitidos:</h4>
                    {activos !== undefined ?
                        <Layout style={{ height: '100%', width: '100%', overflowY: 'auto', backgroundColor: 'white' }}>
                            <Tree
                                checkable
                                multiple
                                checkedKeys={activos}
                                defaultCheckedKeys={activos}
                                defaultExpandedKeys={activos}
                                onCheck={this.onCheck}
                            >
                                {Object.values(perfil_permisos).map((item, index) => (
                                    <TreeNode title={Object.keys(item)} key={"modulo" + Object.keys(item) + index} selectable={false} >
                                        {Object.values(item[Object.keys(item)]).map((acc) => (
                                            <TreeNode title={acc.accion.replace(/_/g, ' ')} key={acc.id_accion} selectable={false} />
                                        ))}
                                    </TreeNode>
                                ))}
                            </Tree>
                        </Layout>
                        :
                        <Layout style={{ height: '100%', width: '100%', overflowY: 'auto', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                            Cargando permisos...
                        </Layout>
                    }
                </Layout>
                <div style={{ display: 'flex', flexDirection: 'row', height: '10%', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', fontSize: 10, textAlign: 'center' }}>
                        <span>
                            modulos permitidos por usuario.&nbsp;
                            <Tooltip title="El usuario solo podra acceder a los modulos seleccionados.">
                                <Icon type="question-circle-o" />
                                &nbsp;
                            </Tooltip>
                        </span>
                    </div>
                    <Button onClick={this.guardarPerfilUsuario.bind(this)} disabled={!this.state.cambios} type="primary" htmlType="button" style={{ display: 'flex', marginRight: 30, width: '40%', height: '90%', justifyContent: 'center' }}>
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
        this.setState({ activos: resultado, cambios: true });
    }

    guardarPerfilUsuario() {
        const { puesto , Server , id_usuario , _usuario } = this.props;
        const { activos } = this.state;
        this.setState({ cargando: true , cambios : false});

        var data = new FormData();
        data.append('id_perfil_permisos' , puesto["id_perfil_permisos"]);
        data.append('activos' , activos.toString());
        data.append('id_usuario' , id_usuario);
        data.append('_usuario' , _usuario);
        
        http._POST(Server + 'configuracion/usuario.php?accion=save_perfil_permisos_usuario' , data).then(res => {
            message.info(res.mns);
        }).catch(err => {
            message.error("Error al guardar perfil puesto." + err);
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

    getPerfilPermisosUsuario() {
        const { puesto, Server , id_usuario } = this.props;
        this.setState({ cargando: true });
        http._GET(Server + "configuracion/usuario.php?accion=get_perfil_permisos_usuario&id_puesto=" + 
                            puesto["id_puesto"] + 
                            "&id_usuario=" + id_usuario).then(res => {
            if (res["err"] == "false") {
                this.setState({
                    perfil_permisos: res['perfil_permisos'],
                    activos: res['activos']
                });
            } else {
                message.error(res["mns"]);
            }
            this.setState({ cargando: false });
        }).catch(err => {
            message.error("Error al cargar perfil puesto." + err);
            this.setState({ cargando: false });
        });
    }
}

export default Form.create()(PerfilUsuario);