import React, { Component } from 'react';
import { Icon, Form, Slider, InputNumber, Tabs, Input, Tooltip, message, Select, Button, Switch } from 'antd';
import http from '../../services/http.services';

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { TextArea } = Input;

class nueva_ticket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ticket_edicion: undefined,
      frm_activo: true,
      frm_categoria: undefined,
      frm_sub_categoria: undefined,
      frm_prioridad: 3,
    }
  }

  componentWillMount() {
    if (this.props.ticket_edicion !== undefined) {
      this.setState({ ticket_edicion: this.props.ticket_edicion });
      this.setState({ frm_prioridad: this.props.ticket_edicion.prioridad_recomendada });
      this.setState({ frm_activo: this.props.ticket_edicion.estado === 1 ? true : false });
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }} >
        <Form onSubmit={this.crearTicket.bind(this)} style={{ width: '100%' }}>
          <div style={{ height: "90%", width: "100%" }}>
            <div style={{ display: 'flex', flexDirection: 'column', }}>
              {(this.state.ticket_edicion === undefined) && <h2 style={{ textAlign: 'center' }}>Nuevo Ticket</h2>}
              {(this.state.ticket_edicion !== undefined) && <h2 style={{ textAlign: 'center' }}>Edición Ticket</h2>}
              <FormItem
                {...formItemLayout}
                label={(
                  <span>
                    Activa&nbsp;
                    <Tooltip title="Si inactivas una ticket, los usuarios no podrán aperturarla.">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
              >
                {getFieldDecorator('activo', { rules: [{ required: false, }] })(
                  <Switch defaultChecked={this.state.frm_activo} onChange={(valor) => { this.setState({ frm_activo: valor }) }} />
                )}
              </FormItem>
            </div>
            <Tabs onChange={() => { }} >
              <TabPane tab="Información Principal" key="1">
                <FormItem label="Título"
                  {...formItemLayout}
                >
                  {getFieldDecorator('titulo_ticket', { initialValue: (this.state.ticket_edicion ? this.state.ticket_edicion.nombre_ticket : ''), rules: [{ required: true, message: 'Por favor indica un título!' }] })(
                    <Input usage prefix={<Icon type="font-size" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Título de la Ticket" />
                  )}
                </FormItem>
                <FormItem label="Categoría"
                  {...formItemLayout}
                >
                  {getFieldDecorator('categoria', {
                    rules: [{ required: true, message: 'Por favor selecciona una categoría!' }], initialValue: (this.props.id_categoria ? String(this.props.id_categoria) : undefined)
                  })(
                    <Select
                      disabled
                      showSearch
                      autoClearSearchValue
                      placeholder="Selecciona una Categoría"
                      optionFilterProp="children"
                      onChange={(seleccion) => { this.setState({ frm_categoria: seleccion }) }}
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >

                      {this.props.categorias.map((categoria, i) => (
                        <Option key={i} value={categoria.id_categoria}>{categoria.categoria}</Option>
                      ))}

                    </Select>
                  )}
                </FormItem>
                <FormItem label="Sub Categoría"
                  {...formItemLayout}
                >
                  {getFieldDecorator('sub_categoria', {
                    rules: [{ required: true, message: 'Por favor selecciona una sub categoría!' }], initialValue: (this.props.sub_categoria ? String(this.props.sub_categoria) : undefined)
                  })(
                    <Select
                      showSearch
                      autoClearSearchValue
                      placeholder="Sub Categoría"
                      optionFilterProp="children"
                      onChange={(seleccion) => { this.setState({ frm_sub_categoria: seleccion }) }}
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {this.props.sub_categorias.map((sub_categoria, i) => (
                        <Option key={i} value={sub_categoria.id_sub_categoria}>{sub_categoria.sub_categoria}</Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={(
                    <span>
                      Tiempo&nbsp;
                  <Tooltip title="Tiempo estimado en minutos para darle solución.">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  )}
                >
                  {getFieldDecorator('minutos_estimados', { initialValue: (this.state.ticket_edicion !== undefined ? parseInt(this.state.ticket_edicion.tiempo_estimado) : undefined), rules: [{ required: true, message: 'Por favor indica un tiempo!' }] })(
                    <InputNumber min={1} placeholder="minutos" />
                  )}
                </FormItem>
                <FormItem label="Descripción:" {...formItemLayout}
                  style={{ display: 'flex', flex: 1, flexDirection: 'row', textAlign: 'center', width: '100%', alignItems: 'center' }}
                >
                  {getFieldDecorator('descripcion', { initialValue: (this.state.ticket_edicion !== undefined ? this.state.ticket_edicion.descripcion : ''), rules: [{ required: false }] })(
                    <TextArea rows={4} style={{ height: '40px' }} placeholder="Breve descripción de la Ticket" />
                  )}
                </FormItem>
                <div style={{ paddingRight: 40, paddingLeft: 40 }}>
                  <FormItem
                    label={(
                      <span>
                        Prioridad&nbsp;
                    <Tooltip title="Indica el nivel de prioridad en el que debe ser resuelta esta ticket">
                          <Icon type="question-circle-o" />
                        </Tooltip>
                      </span>
                    )}
                  >
                    {getFieldDecorator('prioridad', { rules: [{ required: false, }] })(
                      <Slider style={{ marginTop: -3 }} marks={{ 1: 'Muy baja', 2: 'Baja', 3: 'Media', 4: 'Alta', 5: 'Muy alta' }} min={1} max={5} onChange={(valor) => { this.setState({ frm_prioridad: valor }) }} defaultValue={this.state.frm_prioridad} />
                    )}
                  </FormItem>
                </div>
              </TabPane>
              <TabPane tab="Procedimiento" key="2">
                <div style={{ display: 'flex', flex: 1, height: "90%", width: "100%" }}>
                  <FormItem label="Procedimiento:" {...formItemLayout}
                    style={{ width: '100%' }}
                  >
                    {getFieldDecorator('procedimiento', { initialValue: (this.state.ticket_edicion !== undefined ? this.state.ticket_edicion.procedimiento : ''), rules: [{ required: false }] })(
                      <TextArea rows={18} placeholder="Describe cuáles son los pasos técnicos recomendados para dar solución a esta ticket de forma satisfactoria." />
                    )}
                  </FormItem>
                </div>
              </TabPane>
            </Tabs>
          </div>
          <div style={{ display: 'flex', height: "10%", justifyContent: 'center' }}>
            <Button disabled={this.state.cargando} type="primary" htmlType="submit" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              {(!this.state.ticket_edicion) && <div>Crear Ticket</div>}
              {(this.state.ticket_edicion) && <div>Guardar Cambios</div>}
            </Button>
          </div>
        </Form>
      </div>
    )
  }

  crearTicket(e) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ cargando: true });
        let Server = String(this.props.Server);

        var data = new FormData();
        data.append('estado', this.state.frm_activo ? '1' : '0');
        data.append('titulo_ticket', values.titulo_ticket);
        data.append('categoria', values.categoria);
        data.append('sub_categoria', values.sub_categoria);
        data.append('minutos_estimados', values.minutos_estimados);
        data.append('prioridad', this.state.frm_prioridad);
        data.append('descripcion', values.descripcion);
        data.append('procedimiento', values.procedimiento);
        data.append('_usuario' , this.props._usuario);

        if (!this.state.ticket_edicion) {
          http._POST(Server + 'configuracion/ticket.php?accion=nueva_ticket', data).then((res) => {
            if (res !== 'error') {
              message.success("Ticket creada correctamente.");
              this.setState({ cargando: false });
              this.props.closeModalNuevaTicket();
            } else {
              message.error("Ha ocurrido un error.");
              this.setState({ cargando: false });
            }
          }).catch(err => {
            message.error("Ha ocurrido un error." + err);
            this.setState({ cargando: false });
          });
        } else {
          data.append('id_ticket', this.state.ticket_edicion.id_ticket);
          http._POST(Server + 'configuracion/ticket.php?accion=edit_ticket', data).then((res) => {
            if (res !== 'error') {
              message.info("Ticket actualizada correctamente.");
              this.setState({ cargando: false });
              this.props.closeModalNuevaTicket();
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
}

export default Form.create()(nueva_ticket);