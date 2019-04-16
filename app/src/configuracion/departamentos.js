import React, { Component } from 'react';
import VerDepartamento from "../configuracion/ver_departamento"
import Rodal from 'rodal';
import { Grid } from 'semantic-ui-react';

import { Icon, Divider, Form, Input, Tooltip, Upload, message, Button, Switch } from 'antd';
import http from '../services/http.services';

const FormItem = Form.Item;
var subiendo = false

class inicio extends Component {

  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
    this._getColumnWidth = this._getColumnWidth.bind(this);
    this.state = {
      showMenu: false,
      modal_nuevoDpto: false,
      modal_Dpto: false,
      frm_activo: true,
      departamentos: [],
      departamento_edicion: undefined,
      cargando: false,
    }
  }

  componentDidMount() {
    this.getDepartamentos();
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", padding: "10px", width: "100%", height: "100%" }} >
        {this.modalDepartamento()}
        {this.modalNuevoDepartamento()}
        <div style={{ textAlign: 'right' }}>
          <Button
            onClick={this.nuevoDepartamento.bind(this)}
            style={{ backgroundColor: 'transparent', border: 'none', borderColor: 'red', outline: 'none' }}
          >
            <Icon type="plus-circle" style={{ color: '#3498DB', fontSize: 25, paddingRight: 10 }} />
          </Button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3>Departamentos</h3>
          Selecciona un departamento para modificar su catálogo de puestos.
      </div>
        <div style={{ padding: '20px', marginTop: '15px' }}>
          <Grid columns='equal' colums={4} padded stackable >
            {this.state.departamentos.map((departamento, i) => (
              <Grid.Column width={4} key={i}>
                <ItemDepartamento departamento={departamento.data} estado={departamento.estado} visualizarDepartamento={this.visualizarDepartamento.bind(this)} solicitarEdicion={this.solicitarEdicion.bind(this)} />
              </Grid.Column>
            ))}
          </Grid>
        </div>
      </div>
    );
  }

  renderItem({ key, index, style }) {
    console.log(index);
    return (
      <div key={key} style={[{ style }]}>
      </div>
    )
  }

  _getColumnWidth({ index }) {
    switch (index) {
      case 0:
        return 100
      case 1:
        return 300
      default:
        return 50
    }
  }

  nuevoDepartamento() {
    this.setState({ modal_nuevoDpto: !this.state.modal_nuevoDpto })
  }

  modalNuevoDepartamento() {
    const { getFieldDecorator } = this.props.form;
    const { modal_nuevoDpto, departamento_edicion, frm_activo, cargando } = this.state;
    return (
      <Rodal
        animation={'flip'}
        visible={modal_nuevoDpto}
        height={380}
        onClose={() => { this.setState({ modal_nuevoDpto: !modal_nuevoDpto }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(modal_nuevoDpto) &&
          <Form onSubmit={this.crearDepartamento.bind(this)} style={{ height: "100%" }}>
            <div style={{ height: "90%" }}>
              {(departamento_edicion === undefined) && <h2 style={{ textAlign: 'center' }}>Nuevo Departamento</h2>}
              {(departamento_edicion !== undefined) && <h2 style={{ textAlign: 'center' }}>Edición Departamento</h2>}
              <Divider style={{ margin: '0px' }} />
              <FormItem label="Nombre:">
                {getFieldDecorator('nombre_dpto', { initialValue: (departamento_edicion !== undefined ? departamento_edicion.departamento : ''), rules: [{ required: true, message: 'Por favor indica un nombre!' }] })(
                  <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Nombre del departamento" />
                )}
              </FormItem>
              <FormItem label="Ubicación:">
                {getFieldDecorator('ubicacion_dpto', { initialValue: (departamento_edicion !== undefined ? departamento_edicion.ubicacion : ''), rules: [{ required: false }] })(
                  <Input prefix={<Icon type="pic-center" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Ubicación o referencia" />
                )}
              </FormItem>
              <div style={{ display: 'flex', flexDirection: 'row', padding: "10px" }}>
                <FormItem
                  style={{ display: 'flex', flex: 1 }}
                  label={(
                    <span>
                      Activo&nbsp;
                        <Tooltip title="Si inactivas un departamento, sus usarios pertenecientes no podrán crear tickets.">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                  {getFieldDecorator('activo', { rules: [{ required: false, message: "hola" }] })(
                    <Switch defaultChecked={frm_activo} onChange={(valor) => { this.setState({ frm_activo: valor }) }} />
                  )}
                </FormItem>
                <Upload
                  style={{ display: 'flex', flex: 1 }}
                  action={('//jsonplaceholder.typicode.com/posts/')}
                  headers={{
                    authorization: 'authorization-text',
                  }}
                  onChange={this.onChange}
                  beforeUpload={this.beforeUpload}
                  multiple={false}
                  disabled={subiendo}
                  listType='picture'
                >
                  <Button>
                    <Icon type="upload" /> Imagen/Logo
                    </Button>
                </Upload>

              </div>
            </div>
            <div style={{ display: 'flex', height: "10%", justifyContent: 'center' }}>
              <Button disabled={cargando} type="primary" htmlType="submit" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                {(!departamento_edicion) && <div>Crear</div>}
                {(departamento_edicion) && <div>Guardar Cambios</div>}
              </Button>
            </div>
          </Form>
        }
      </Rodal>
    )
  }

  modalDepartamento() {
    const { modal_Dpto, departamento_edicion } = this.state;
    const { Server } = this.props;
    return (
      <Rodal
        animation={'slideUp'}
        visible={modal_Dpto}
        height={600}
        width={900}
        onClose={() => { this.setState({ modal_Dpto: !modal_Dpto, departamento_edicion: undefined, frm_activo: true }) }}
        closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(this.state.modal_Dpto) &&
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '10%', marginTop: '10%' }}>
              <Button
                onClick={this.solicitarEdicion.bind(this)}
                style={{ backgroundColor: 'transparent', border: 'none', borderColor: 'red', outline: 'none' }}
              >
                <span>
                  <Tooltip title="Editar Departamento">
                    <Icon type="edit" style={{ color: '#3498DB', fontSize: 25, paddingRight: 10 }} />
                  </Tooltip>
                </span>
              </Button>
            </div>
            <VerDepartamento getDepartamentos={this.getDepartamentos.bind(this)} id_departamento={departamento_edicion.id_departamento} Server={Server} />
          </div>
        }
      </Rodal>
    )
  }

  regrescarDepartamento() {
    const { departamento_edicion } = this.state;

    let Server = String(this.props.Server)
    this.setState({ cargando: true })
    var data = new FormData();
    data.append('id_departamento', departamento_edicion.id_departamento);

    http._POST(Server + 'configuracion/departamento.php?accion=one', data).then(res => {
      if (res !== 'error') {
        this.setState({ departamento_edicion: res });
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

  crearDepartamento(e) {
    e.preventDefault();
    const { form, Server } = this.props;
    const { departamento_edicion, frm_activo } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        this.setState({ cargando: true })
        let server = String(Server)
        var data = new FormData();
        data.append('nombre_departamento', values.nombre_dpto);
        data.append('ubicacion_dpto', values.ubicacion_dpto);
        data.append('estado', frm_activo ? '1' : '0');

        if (!departamento_edicion) {
          http._POST(server + 'configuracion/departamento.php?accion=nuevo', data).then(res => {
            if (res !== 'error') {
              this.setState({ modal_nuevoDpto: false });
              message.success("Departamento creado correctamente.");
              this.setState({ cargando: false });
              this.getDepartamentos()
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false })
            }
          }).catch(err => {
            message.error("Ha ocurrido un error." + err);
            this.setState({ cargando: false })
          });
        } else {
          data.append('id_departamento', departamento_edicion.id_departamento);
          http._POST(Server + 'configuracion/departamento.php?accion=edit', data).then(res => {
            if (res !== 'error') {
              this.setState({ modal_nuevoDpto: false })
              message.info("Departamento actualizado correctamente.");
              this.setState({ cargando: false });
              this.regrescarDepartamento();
              this.getDepartamentos();
              this.setState({ modal_Dpto: false }, () => {
                this.setState({ modal_Dpto: true });
              })
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false })
            }
          }).catch(err => {
            message.error("Ha ocurrido un error." + err);
            this.setState({ cargando: false });
          });
        }
      }
    });
  }

  getDepartamentos() {
    let Server = String(this.props.Server);
    this.setState({ cargando: true });

    http._GET(Server + 'configuracion/departamento.php?accion=get').then(res => {
      if (res !== 'error') {
        let resultado = [];
        for (const objecto of res) {
          resultado.push(
            {
              data: objecto,
              estado: JSON.parse(objecto.estado_final),
            }
          )
        }
        this.setState({ departamentos: resultado });
        this.setState({ cargando: false });
      } else {
        message.error("Error al cargar Departamentos.");
        this.setState({ cargando: false });
      }
    }).catch(err => {
      message.error("Error al cargar Departamentos." + err);
      this.setState({ cargando: false });
    });
  }

  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    } else {
      subiendo = true
    }

    if (info.file.status === 'done') {
      subiendo = false
      message.success(`${info.file.name} imagen adjuntada correctamente.`);
      //alert(JSON.stringify(info.fileList))
    } else if (info.file.status === 'error') {
      subiendo = false
      message.error(`${info.file.name} error en subida.`);
    }
  }

  beforeUpload(file) {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJPG) {
      message.error('Únicamente puedes subir imágenes (JPEG y PNG)!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('El tamaño de la imagen debe ser menor a 2MB!');
    }
    return isJPG && isLt2M;
  }

  visualizarDepartamento(recibo) {
    this.setState({ modal_Dpto: false })
    this.setState({ departamento_edicion: recibo }, () => {
      this.setState({ modal_Dpto: true })
    })
  }

  solicitarEdicion() {
    const { departamento_edicion, modal_nuevoDpto } = this.state;
    if (departamento_edicion.estado === '1') {
      this.setState({ frm_activo: true });
    } else {
      this.setState({ frm_activo: false });
    }
    this.setState({ modal_nuevoDpto: !modal_nuevoDpto });
  }
}

class ItemDepartamento extends Component {

  render() {
    const { departamento, visualizarDepartamento, estado } = this.props;
    return (
      <Button
        onClick={() => { visualizarDepartamento(departamento) }}
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

        {(!departamento.imagen) &&
          <div>
            {(estado.estado === 'Activo') &&
              <img src={require('../media/departamento_activo.png')} alt="actico" width="50%" />
            }
            {(estado.estado === 'Inactivo') &&
              <img src={require('../media/departamento_inactivo.png')} alt="inactivo" width="50%" />
            }
          </div>
        }
        <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap' }}>
          {departamento.departamento}
        </div>
        <div style={{ flex: 1, height: '100%' }}></div>
        <div style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>
          {estado.motivo}
        </div>
      </Button>
    )
  }
}

export default Form.create()(inicio);