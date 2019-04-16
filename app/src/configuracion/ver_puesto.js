import React, { Component } from 'react';

import TicketsSoportePuesto from "../configuracion/forms/perfil_tickets_soporte"
import { Icon, Tree, Layout , Form, Tabs, Tooltip, message, Button, Switch } from 'antd';
import _ from 'lodash';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const TreeNode = Tree.TreeNode;

class ver_puesto extends Component {

  constructor(props){
    super(props);
    this.state={
      cargando: false,
      puesto: undefined,
      tickets_all: [],
    }
  }

  componentDidMount(){
    this.cargarPuesto()
    this.getTicketsAll()
  }


  render() {

    return (
      <div style={{ display: "flex", flex:1, flexDirection:"column", width: "100%", height: "100%"}} >
      {(this.state.puesto)&&
      <div>
        <div style={{marginRight:40, display:'flex', flexDirection:'row', textAlign:'center', alignItems:'center', justifyContent:'center'}}>
          <h2 style={{display:'flex', flex:1, justifyContent:'center',}}>
            {(this.state.puesto !== undefined)&&this.state.puesto.puesto}
          </h2>
          <div style={{display:'flex', flexDirection:'row'}}>
            <FormItem
              style={{display:'flex', justifyContent:'flex-end', marginRight:20}}
              label={(
                <span>
                  Activo&nbsp;
                  <Tooltip title="Si desactivas un puesto, sus usuarios pertenecientes no podrán crear tickets.">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )}
            >
              <Switch loading={this.state.cargando} defaultChecked={this.state.puesto.estado == 1?true:false}  onChange={(valor)=>{ this.cambiarEstadoPuesto(valor) }}/>
            </FormItem>
            <FormItem
              style={{display:'flex', justifyContent:'flex-end'}}
              label={(
                <span>
                  Soporte&nbsp;
                  <Tooltip title="Permitir a este puesto brindar soporte (despachar tickets).">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )}
            >
              <Switch loading={this.state.cargando} defaultChecked={parseInt(this.state.puesto.soporte) == 1?true:false}  onChange={(valor)=>{ this.cambiarEstadoPuestoSoporte(valor) }}/>
            </FormItem>
          </div>
        </div>
        <Tabs defaultActiveKey="1" style={{ display:'flex', flex:1, height:'100%', width:'100%', flexDirection:'column', }}>
          {(this.state.tickets_all !== [])&&
          <TabPane tab="Perfil Tickets" key="1"><PerfilTickets getPuestos={this.props.getPuestos.bind(this)} puesto={this.state.puesto} id_puesto={this.props.id_puesto} tickets_all={this.state.tickets_all} Server={this.props.Server}/></TabPane>
          }
          <TabPane tab="Perfil Permisos" key="2"><PerfilPermisos/></TabPane>
          {(parseInt(this.state.puesto.soporte) == 1) &&
          <TabPane tab="Soporte" key="3"><PerfilTicketsSoportePuesto  puesto={this.state.puesto} id_puesto={this.props.id_puesto} tickets_all={this.state.tickets_all} Server={this.props.Server}/></TabPane>
          }
        </Tabs>
      </div>
      }
      </div>
    );
  }

  cambiarEstadoPuestoSoporte(estado){

    let Server = String(this.props.Server)

    this.setState({cargando:true})

    var cambiar_a=1
    if(!estado){
      cambiar_a=0
    }

    var data = new FormData();
    data.append('id_puesto', this.props.id_puesto);
    data.append('estado', cambiar_a);

    fetch(Server+'configuracion/puesto.php?accion=cambiar_estado_soporte', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                    },
                    body: data
                })
                .then((response) => response.json())
                .then((responseJson) => {

                    if(responseJson !== 'error'){

                      this.setState({cargando:false})

                      this.cargarPuesto()

                      this.props.getPuestos()


                    }else{
                      message.error("Error al actualizar estado.");
                      this.setState({cargando:false})
                    }

                })
                .catch((error) => {
                  message.error("Error al actualizar estado."+error);
                  this.setState({cargando:false})
                });

  }


  cambiarEstadoPuesto(estado){

    let Server = String(this.props.Server)

    this.setState({cargando:true})

    var cambiar_a=1
    if(!estado){
      cambiar_a=0
    }

    var data = new FormData();
    data.append('id_puesto', this.props.id_puesto);
    data.append('estado', cambiar_a);

    fetch(Server+'configuracion/puesto.php?accion=estado', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                    },
                    body: data
                })
                .then((response) => response.json())
                .then((responseJson) => {

                    if(responseJson !== 'error'){

                      this.setState({cargando:false})

                      this.cargarPuesto()

                      this.props.getPuestos()


                    }else{
                      message.error("Error al actualizar estado.");
                      this.setState({cargando:false})
                    }

                })
                .catch((error) => {
                  message.error("Error al actualizar estado."+error);
                  this.setState({cargando:false})
                });


  }


  cargarPuesto(){

    let Server = String(this.props.Server)

    this.setState({cargando:true})

    var data = new FormData();
    data.append('id_puesto', this.props.id_puesto);

    fetch(Server+'configuracion/puesto.php?accion=one', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                    },
                    body: data
                })
                .then((response) => response.json())
                .then((responseJson) => {

                    if(responseJson !== 'error'){

                      //alert(JSON.stringify(responseJson))
                      this.setState({puesto:undefined},()=>{
                        this.setState({puesto:responseJson})
                      })


                      this.setState({cargando:false})


                    }else{
                      message.error("Error al cargar Departamento.");
                      this.setState({cargando:false})
                    }

                })
                .catch((error) => {
                  message.error("Error al cargar Departamento."+error);
                  this.setState({cargando:false})
                });



  }

  //funcion para arrays anidados con lodash
  nest (seq, keys) {
      if (!keys.length)
          return seq;
      var first = keys[0];
      var rest = keys.slice(1);
      return _.mapValues(_.groupBy(seq, first), function (value) {
          return this.nest(value, rest)
      });
  }


  getTicketsAll(){

    let Server = String(this.props.Server)

    this.setState({cargando:true})

    fetch(Server+'configuracion/ticket.php?accion=get_tickets_all', {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                    },
                })
                .then((response) => response.json())
                .then((responseJson) => {

                    if(responseJson !== 'error'){
                      let resultado= [];
                      for(const objecto of responseJson){
                        resultado.push(
                          { categoria: objecto.categoria,
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

                      var group1 = _.groupBy(resultado, (b) => b.categoria )
                      var llaves=Object.keys(group1)
                      let agrupado_final= [];

                      var i=0
                      while(i<llaves.length){
                        let index= llaves[i]
                        var grupito = _.groupBy(group1[llaves[i]], (b) => b.sub_categoria)
                        agrupado_final.push(
                          { [index] : [grupito] }
                        )
                        i++;
                      }

                    //  console.log(JSON.stringify(agrupado_final))
                      this.setState({tickets_all:agrupado_final})


                      this.setState({cargando:false})


                    }else{
                      message.error("Error al cargar Categorías.");
                      this.setState({cargando:false})
                    }

                })
                .catch((error) => {
                  message.error("Error al cargar Categorías."+error);
                  this.setState({cargando:false})
                });


  }







}



class PerfilPermisos extends Component {

  render(){
    return(
      <div>



        Perfil de permisos (módulos del sistema).



      </div>
    )
  }


}

class PerfilTickets extends Component {


  constructor(props){
    super(props);
    this.state={
      frm_activo_aplicar_todos: true,

      tickets_seleccionadas: undefined,

      expanded: false,

      cargando: false,

      cambios: false,

      actualizar: false,

    }
  }

  componentDidMount(){
    this.getTicketsPerfil()
  }


  render(){

    //let objetos=JSON.parse(this.props.tickets_all)


    return(

      <div style={{display:'flex', flex:1, flexDirection:'column', height:'297px',}}>

        <Layout style={{ height:'100%', flexDirection:'row', backgroundColor:'white',}}>

          <Layout style={{ height:'100%', width:'40%', backgroundColor:'white', fontSize:10, padding:'10px'}}>

            <h4>Instrucciones</h4>
            <div style={{lineHeight:2, textAlign:'justify'}}>
            Selecciona las tickets que consideras adecuadas para este puesto. Las tickets seleccionadas serán las las asignadas por defecto al los usuarios que crees con este puesto. Si limitas las tickets en este puesto, sus usuarios sólo podrán usar las tickets seleccionadas, de lo contrario podrán acceder al resto de tickets a través del botón "Mostrar más", en el panel de Envío de Tickets.
            </div>

          </Layout>


          <Layout style={{height:'100%',  width:'60%', overflowY: 'auto', backgroundColor:'white', padding:'10px', marginLeft:40}}>

            <h4>Selecciona Tickets:</h4>
            {this.state.tickets_seleccionadas!==undefined ?
            <Layout style={{height:'100%',  width:'100%', overflowY: 'auto', backgroundColor:'white'}}>
            <Tree
                checkable
                multiple
                checkedKeys={this.state.tickets_seleccionadas}
                defaultCheckedKeys={this.state.tickets_seleccionadas}
                defaultExpandedKeys={this.state.tickets_seleccionadas}
                onCheck={this.onCheck}
              >
              {Object.values(this.props.tickets_all).map((item, index) => (


                <TreeNode title={Object.keys(item)} key={"cat"+Object.keys(item)+index} selectable={false} >

                  {Object.entries(item[Object.keys(item)][0]).map((item,index)=>(

                      <TreeNode title={item[0]} key={"sub_cat"+item[0]+index} selectable={false} >

                        {Object.entries(item[1]).map((item,index)=>(

                              <TreeNode title={item[1].nombre_ticket} key={item[1].id_ticket} selectable={false} />

                        ))}

                      </TreeNode>

                  ))}

                </TreeNode>
              ))}
              </Tree>
              </Layout>
              :
              <Layout style={{height:'100%',  width:'100%', overflowY: 'auto', backgroundColor:'white', alignItems:'center', justifyContent:'center'}}>
                Cargando tickets...
              </Layout>
              }

              {this.state.tickets_seleccionadas == [] &&
                <Layout style={{height:'100%',  width:'100%', overflowY: 'auto', backgroundColor:'white', alignItems:'center', justifyContent:'center'}}>
                  Sin tickets creadas
                  <label style={{fontSize:10}}>Ve a Configuración>Tickets para crear una.</label>
                </Layout>
              }

          </Layout>


        </Layout>

        <Layout>

        </Layout>

        <div style={{display:'flex', flexDirection:'row', height:'10%', alignItems:'center', justifyContent:'flex-end'}}>

          {(this.props.puesto)&&
          <div style={{display:'flex', flex:1, width:'100%', flexDirection:'row', alignItems:'center', justifyContent:'center'}}>

            <div style={{marginRight:20, alignItems:'center', justifyContent:'center'}}>
            <span>
              Limitar a Selección&nbsp;
              <Tooltip title="Si limitas el Perfil de Tickets a las tickes seleccionadas no se le mostrará a los usuarios de este puesto otras tickets.">
                <Icon type="question-circle-o" />
              </Tooltip>
              &nbsp;
            </span>
            <Switch size="small" defaultChecked={this.props.puesto.limitar_tickets == '1'?true:false}  onChange={(valor)=>{this.setState({frm_activo_aplicar_todos:valor, cambios:true})}}/>
            </div>

            <div style={{alignItems:'center', justifyContent:'center'}}>
            <span>
              Actualizar&nbsp;
              <Tooltip title="Se actualizará el perfil en cada asignación del puesto. Ello implica reemplazar el perfil anterior por el nuevo.">
                <Icon type="question-circle-o" />
              </Tooltip>
              &nbsp;
            </span>
            <Switch size="small" defaultChecked={this.state.actualizar}  onChange={(valor)=>{this.setState({actualizar:valor, cambios:true})}}/>
            </div>

          </div>
          }

          <Button onClick={ this.guardarPerfilTickets.bind(this) } disabled={!this.state.cambios} type="primary" htmlType="button" style={{display:'flex', marginRight:30, width:'40%', height:'90%', justifyContent:'center'}}>
            Guardar Cambios
          </Button>

        </div>


      </div>

  )

}

  onCheck = (checkedKeys, info) => {
    console.log('onCheck', checkedKeys, info);


    let resultado=new Array()
    for(const objecto of checkedKeys){
      if(!this.tiene_letras(objecto)){
        resultado.push(
          objecto
        )
      }
    }

    //alert(JSON.stringify(resultado))

    this.setState({tickets_seleccionadas:resultado, cambios:true})


  }

  guardarPerfilTickets(){

    let Server = String(this.props.Server)

    this.setState({cargando:true, cambios:false})

    var estado='1'
    if(!this.state.frm_activo_aplicar_todos){
      var estado='0'
    }


    var data = new FormData();
    data.append('id_puesto', this.props.id_puesto);
    data.append('perfil', JSON.stringify(this.state.tickets_seleccionadas));
    data.append('limitar', estado);


    fetch(Server+'configuracion/puesto.php?accion=guardar_perfil', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                    },
                    body: data
                })
                .then((response) => response.json())
                .then((responseJson) => {

                    if(responseJson !== 'error'){

                      this.setState({cargando:false, cambios:false})

                      message.info("Perfil actualizado correctamente.");

                      this.props.getPuestos()

                      if(this.state.actualizar){
                        this.actualizarPerfilUsuariosPuesto(this.props.id_puesto)
                      }

                    }else{
                      message.error("Error al actualizar perfil.");
                      this.setState({cargando:false, cambios:true})
                    }

                })
                .catch((error) => {
                  message.error("Error al actualizar perfil."+error);
                  this.setState({cargando:false, cambios:true})
                });

  }

  actualizarPerfilUsuariosPuesto(id_puesto){

    let Server = String(this.props.Server)

    this.setState({cargando:true, cambios:false})


    var data = new FormData();
    data.append('id_puesto', id_puesto);


    fetch(Server+'configuracion/puesto.php?accion=actualizar_perfil_usuarios_puesto', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                    },
                    body: data
                })
                .then((response) => response.json())
                .then((responseJson) => {

                    if(responseJson !== 'error'){

                      this.setState({cargando:false, cambios:false})

                      message.info("Usuarios actualizados correctamente.");

                    }else{
                      message.error("Error al actualizar usuarios.");
                      this.setState({cargando:false, cambios:true})
                    }

                })
                .catch((error) => {
                  message.error("Error al actualizar usuarios."+error);
                  this.setState({cargando:false, cambios:true})
                });

  }



  tiene_letras(texto){
     var letras="abcdefghyjklmnñopqrstuvwxyz";
     texto = texto.toLowerCase();
     for(var i=0; i<texto.length; i++){
        if (letras.indexOf(texto.charAt(i),0)!=-1){
           return true;
        }
     }
     return false;
  }


  getTicketsPerfil(){

    let Server = String(this.props.Server)

    var data = new FormData();
    data.append('id_puesto', this.props.id_puesto);

    this.setState({cargando:true})

    fetch(Server+'configuracion/puesto.php?accion=get_perfil', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                    },
                    body: data
                })
                .then((response) => response.json())
                .then((responseJson) => {

                    if(responseJson !== 'error'){

                      let resultado=new Array()
                      for(const objecto of responseJson){
                        resultado.push(
                          objecto.id_ticket
                        )
                      }

                      setTimeout(()=>{
                        this.setState({tickets_seleccionadas:resultado})
                    },500)
                      //this.setState({tickets_seleccionadas:resultado})


                      //alert(JSON.stringify(resultado))


                      this.setState({cargando:false})


                    }else{
                      message.error("Error al cargar Usuarios.");
                      this.setState({cargando:false})
                    }

                })
                .catch((error) => {
                  message.error("Error al cargar Usuarios."+error);
                  this.setState({cargando:false})
                });




  }


}




class PerfilTicketsSoportePuesto extends Component {


  constructor(props){
    super(props);
    this.state={

      cargando: false,

    }
  }

  componentDidMount(){
  }


  render(){

    //let objetos=JSON.parse(this.props.tickets_all)


    return(

      <div style={{height:'100%', width:'100%',}}>

        <Tabs
          defaultActiveKey={"0"}
          tabPosition={"left"}
        >

          <TabPane tab={"GLOBAL"} key={"0"}><TicketsSoportePuesto tipo={'global'} Server={this.props.Server} id_puesto={this.props.id_puesto} tickets_all={this.props.tickets_all}/></TabPane>

          <TabPane tab={this.props.puesto.puesto} key={"1"}><TicketsSoportePuesto tipo={'puesto'} Server={this.props.Server} id_puesto={this.props.id_puesto} tickets_all={this.props.tickets_all}/></TabPane>

        </Tabs>


      </div>

  )

}





}






export default ver_puesto;
