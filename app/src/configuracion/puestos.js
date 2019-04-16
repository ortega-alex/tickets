import React, { Component } from 'react';

import VerPuesto from "../configuracion/ver_puesto";
import Rodal from 'rodal';
import { Grid } from 'semantic-ui-react';
import { Icon, Divider, Form, Input, Tooltip, message, Button, Switch } from 'antd';
import http from '../services/http.services';

const FormItem = Form.Item;
var subiendo = false;

class puestos extends Component {

  constructor(props) {
    super(props);
    this._getColumnWidth = this._getColumnWidth.bind(this);

    this.state = {
      showMenu: false,
      modal_nuevoPuesto: false,
      modal_Puesto: false,
      frm_activo: true,
      puestos: [],
      puesto_edicion: undefined,
      cargando: false,
    }
  }

  componentDidMount() {
    this.getPuestos();
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", padding: "10px", width: "100%", height: "100%" }} >
        {this.modalPuesto()}
        {this.modalNuevoPuesto()}
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={this.nuevoPuesto.bind(this)}
            style={{ backgroundColor: 'transparent', border: 'none', borderColor: 'red', outline: 'none' }}
          >
            <Icon type="plus-circle" style={{ color: '#3498DB', fontSize: 25, paddingRight: 10 }} />
          </button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3>Puestos</h3>
          Selecciona un puesto para modificar su perfil.
      </div>
        <div style={{ padding: '20px', marginTop: '15px' }}>
          <Grid columns='equal' colums={4} padded stackable >
            {this.state.puestos.map((puesto, i) => (
              <Grid.Column width={4} key={i}>
                <ItemPuesto puesto={puesto} visualizarPuesto={this.visualizarPuesto.bind(this)} solicitarEdicion={this.solicitarEdicion.bind(this)} />
              </Grid.Column>
            ))}
          </Grid>
        </div>
      </div>
    );
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

  nuevoPuesto() {
    this.setState({ modal_nuevoPuesto: !this.state.modal_nuevoPuesto });
  }

  modalNuevoPuesto() {
    const { getFieldDecorator } = this.props.form;
    const { puesto_edicion, modal_nuevoPuesto, frm_activo, cargando } = this.state;
    return (
      <Rodal
        animation={'flip'}
        visible={modal_nuevoPuesto}
        height={330}
        onClose={() => { this.setState({ modal_nuevoPuesto: !modal_nuevoPuesto }) }}
        closeOnEsc closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(modal_nuevoPuesto) &&
          <Form onSubmit={this.crearPuesto.bind(this)} style={{ height: "100%" }}>
            <div style={{ height: "90%" }}>
              {(puesto_edicion == undefined) && <h2 style={{ textAlign: 'center' }}>Nuevo Puesto</h2>}
              {(puesto_edicion != undefined) && <h2 style={{ textAlign: 'center' }}>Edición Puesto</h2>}
              <Divider style={{ margin: '0px' }} />
              <FormItem label="Nombre:">
                {getFieldDecorator('nombre_puesto', { initialValue: (puesto_edicion != undefined ? puesto_edicion.puesto : ''), rules: [{ required: true, message: 'Por favor indica un nombre!' }] })(
                  <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Nombre del puesto" />
                )}
              </FormItem>
              <div style={{ display: 'flex', flexDirection: 'row', padding: "10px" }}>
                <FormItem
                  style={{ display: 'flex', flex: 1 }}
                  label={(
                    <span>
                      Activo&nbsp;
                        <Tooltip title="Si inactivas un puesto, sus usarios pertenecientes no podrán crear tickets.">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                  {getFieldDecorator('activo', { rules: [{ required: false, }] })(
                    <Switch defaultChecked={frm_activo} onChange={(valor) => { this.setState({ frm_activo: valor }) }} />
                  )}
                </FormItem>
              </div>
            </div>
            <div style={{ display: 'flex', height: "10%", justifyContent: 'center' }}>
              <Button disabled={cargando} type="primary" htmlType="submit" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                {(!puesto_edicion) && <div>Crear</div>}
                {(puesto_edicion) && <div>Guardar Cambios</div>}
              </Button>
            </div>
          </Form>
        }
      </Rodal>
    )
  }

  modalPuesto() {
    const { Server } = this.props;
    const { puesto_edicion, modal_Puesto } = this.state;
    return (
      <Rodal
        animation={'slideUp'}
        visible={modal_Puesto}
        height={450}
        width={750}
        onClose={() => { this.setState({ modal_Puesto: !modal_Puesto, puesto_edicion: undefined, frm_activo: true }) }}
        closeOnEsc closeMaskOnClick
        showCloseButton={true}
        customStyles={{ borderRadius: 10 }}
      >
        {(this.state.modal_Puesto) &&
          <div style={{ display: 'flex', flex: 1, height: '100%', flexDirection: 'row' }}>
            <div style={{ width: '10%', marginTop: '10%' }}>
              <Button
                onClick={this.solicitarEdicion.bind(this)}
                style={{ backgroundColor: 'transparent', border: 'none', borderColor: 'red', outline: 'none' }}
              >
                <span>
                  <Tooltip title="Editar Puesto">
                    <Icon type="edit" style={{ color: '#3498DB', fontSize: 25, paddingRight: 10 }} />
                  </Tooltip>
                </span>
              </Button>
            </div>
            <div style={{ display: 'flex', flex: 1, }}>
              <VerPuesto Server={Server} id_puesto={puesto_edicion.id_puesto} getPuestos={this.getPuestos.bind(this)} />
            </div>
          </div>
        }
      </Rodal>
    )
  }

  crearPuesto(e) {
    e.preventDefault();
    const { form, Server } = this.props;
    const { frm_activo, puesto_edicion } = this.state;
    form.validateFields((err, values) => {
      if (!err) {
        this.setState({ cargando: true });
        let server = String(Server);
        var data = new FormData();
        data.append('nombre_puesto', values.nombre_puesto);
        data.append('estado', frm_activo ? '1' : '0');

        if (!puesto_edicion) {
          http._POST(server + 'configuracion/puesto.php?accion=nuevo', data).then(res => {
            if (res !== 'error') {
              this.setState({ modal_nuevoPuesto: false });
              message.success("Puesto creado correctamente.");
              this.setState({ cargando: false });
              this.getPuestos();
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false });
            }
          }).catch(err => {
            message.error("Ha ocurrido un error." + err);
            this.setState({ cargando: false })
          });
        } else {
          data.append('id_puesto', puesto_edicion.id_puesto);
          http._POST(Server + 'configuracion/puesto.php?accion=edit', data).then(res => {
            if (res !== 'error') {
              this.setState({ modal_nuevoPuesto: false });
              message.info("Puesto actualizado correctamente.");
              this.setState({ modal_Puesto: false }, () => {
                this.setState({ modal_Puesto: true });
              })
              this.setState({ cargando: false });
              this.getPuestos();
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false });
            }
          }).catch(err => {
            message.error("Ha ocurrido un error." + err);
            this.setState({ cargando: false });
          });
        }
      }
    });
  }

  getPuestos() {
    let Server = String(this.props.Server);
    this.setState({ cargando: true })

    http._GET(Server + 'configuracion/puesto.php?accion=get').then(res => {
      if (res !== 'error') {
        let resultado = [];
        for (const objecto of res) {
          resultado.push(
            {
              id_puesto: objecto.id_puesto,
              puesto: objecto.puesto,
              id_perfil_puesto_tickets: objecto.id_perfil_puesto_tickets,
              id_perfil_permisos: objecto.id_perfil_permisos,
              estado: objecto.estado,
              creacion: objecto.creacion,
              soporte: objecto.soporte,
              estado_final: JSON.parse(objecto.estado_final),
            }
          )
        }
        this.setState({ puestos: resultado });
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
      subiendo = true;
    }

    if (info.file.status == 'done') {
      subiendo = false
      message.success(`${info.file.name} imagen adjuntada correctamente.`);
    } else if (info.file.status == 'error') {
      subiendo = false
      message.error(`${info.file.name} error en subida.`);
    }
  }

  beforeUpload(file) {
    const isJPG = file.type == 'image/jpeg' || file.type == 'image/png';
    if (!isJPG) {
      message.error('Únicamente puedes subir imágenes (JPEG y PNG)!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('El tamaño de la imagen debe ser menor a 2MB!');
    }
    return isJPG && isLt2M;
  }

  visualizarPuesto(recibo) {
    this.setState({ puesto_edicion: recibo }, () => {
      this.setState({ modal_Puesto: true });
    });
  }

  solicitarEdicion() {
    const { puesto_edicion, modal_nuevoPuesto } = this.state;
    if (puesto_edicion.estado == '1') {
      this.setState({ frm_activo: true });
    } else {
      this.setState({ frm_activo: false });
    }
    this.setState({ modal_nuevoPuesto: !modal_nuevoPuesto });
  }
}

class ItemPuesto extends Component {
  render() {
    const { puesto, visualizarPuesto } = this.props;
    return (
      <Button
        onClick={() => { visualizarPuesto(puesto) }}
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

        {(parseInt(puesto.soporte) == 1) &&
          <Icon type="tool" style={{ fontSize: 12, color: '#27AE60' }} />
        }

        {(!puesto.imagen) &&
          <div>
            {(puesto.estado_final.estado == 'Activo') &&
              <img src={require('../media/puesto_activo.png')} width='50%' />
            }
            {(puesto.estado_final.estado == 'Inactivo') &&
              <img src={require('../media/puesto_inactivo.png')} width='50%' />
            }
          </div>
        }

        <div style={{ width: '100%', height: '100%', whiteSpace: 'pre-wrap' }}>
          {puesto.puesto}
        </div>

        <div style={{ fontSize: 10, whiteSpace: 'pre-wrap' }}>
          {puesto.estado_final.motivo}
        </div>
      </Button>
    )
  }
}

export default Form.create()(puestos);