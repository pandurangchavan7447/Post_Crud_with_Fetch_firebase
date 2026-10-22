let cl= console.log;

const post_form = document.getElementById("post_form");
const title_control = document.getElementById("title_control");
const content_control = document.getElementById("content_control");
const userid_control = document.getElementById("userid_control");
const addpostbtn = document.getElementById("addpostbtn");
const updatepostbtn = document.getElementById("updatepostbtn");
const post_container = document.getElementById("post_container");
const spinner = document.getElementById("spinner");



const base_url="";
const posts_url=`${base_url}/posts.json`


let state={
    postArr:[],
    edit_id:null
}


function snackbar(mes,Icon){
 Swal.fire({
  title: mes,
  icon: Icon,
  draggable: true,
  timer:3000,
});
}

function spinnerhand(flag){
    if(flag){
      spinner.classList.remove("d-none");
    }
    else{
        spinner.classList.add("d-none")
    }
}


function Objtoarr(obj){
    for (const key in obj){
       obj[key].id=key
       state.postArr.push(obj[key])
    }   
}


function fetchposts(){
    spinnerhand(true)
    fetch(posts_url,{
        method:"GET",
        body:null,
        headers:{
            "content-type":"application json",
            "auth":"JWT token"
        }
    })
    .then(function(res){
        if(!res.ok){
            throw new Error("err");
        }
        return res.json()
    })
    .then(function(data){
        Objtoarr(data);
        readpost(state.postArr)
    }).catch(function(err){
        cl("err")
    }).finally(()=>{
       spinnerhand()
    })
}

fetchposts();




function readpost(arr){
    let result=""
    arr.forEach(post => {
        result+=`
          <div class="col-md-3 mb-3" id="${post.id}">
            <div class="card h-100">
               <div class="card-header bg-dark text-white">
                 <h3>${post.title}</h3>
               </div>
               <div class="card-body content">
                  <p>${post.post}</p>
               </div>
               <div class="card-footer d-flex bg-dark text-white justify-content-between">
                  <button onclick="onedithand(this)" class="btn btn-info">Edit</button>
                  <button onclick="ondelete(this)" class="btn btn-warning">Delete</button>
               </div>
            </div>
         </div>
        `
    });
    post_container.innerHTML=result;
}


// create functionality....

function onsubmit(eve){
    spinnerhand(true)
  eve.preventDefault()
  let new_post={
    title:title_control.value,
    post:content_control.value,
    userId:userid_control.value
  }
   fetch(posts_url,{
     method:"POST",
     body:JSON.stringify(new_post),
     headers:{
        "content-type":"application json",
        "auth":"JWT token"
     }
   }).then(function(res){
      if(!res.ok){
        throw new Error("err")
      }
      return res.json()
   })
   .then(function(data){
       new_post.id= data.name;
       state.postArr.push(new_post);

       let col = document.createElement("div")
       col.id=data.name
       col.className="col-md-3 mb-3"
       col.innerHTML=`
           <div class="card h-100">
               <div class="card-header bg-dark text-white">
                 <h3>${new_post.title}</h3>
               </div>
               <div class="card-body content">
                  <p>${new_post.post}</p>
               </div>
               <div class="card-footer d-flex bg-dark text-white justify-content-between">
                  <button onclick="onedithand(this)" class="btn btn-info">Edit</button>
                  <button onclick="ondelete(this)" class="btn btn-warning">Delete</button>
               </div>
            </div>
       `
       post_container.append(col);
       snackbar(`Your post wit id ${new_post.id} is added successfully`,"success")
       post_form.reset()
   }).catch(function(err){
      cl(err)
   }).finally(()=>{
     spinnerhand()
   })

}


function onedithand(ele){
    spinnerhand(true)
    addpostbtn.classList.add("d-none")
    updatepostbtn.classList.remove("d-none")
    let edit_id= ele.closest(".col-md-3").id
    state.edit_id=edit_id
    let edit_url=`${base_url}/posts/${edit_id}.json`

    fetch(edit_url,{
        method:"GET",
        body:null,
        headers:{
            "content-type":"application json",
            "auth":"JWT token"
        }
    }).then(function(res){
        if(!res.ok){
            throw new Error("err")
        }
        return res.json()
    }).then(function(data){
        title_control.value=data.title
        content_control.value=data.post
        userid_control.value=data.userId
    }).finally(()=>{
        spinnerhand()
    })
}




// update functionality...

function onupdatehand(){
    spinnerhand(true)
    let update_id=state.edit_id
    let update_url = `${base_url}/posts/${update_id}.json`

    let updated_obj={
        title:title_control.value,
        post:content_control.value,
        userId:userid_control.value,
        id:update_id,

    }
    fetch(update_url,{
        method:"PATCH",
        body:JSON.stringify(updated_obj),
        headers:{
            "content-type":"application json",
            "auth":"JWT token"
        }
    }).then(function(res){
        if(!res.ok){
            throw new Error("err")
        }
        return res.json()
    }).then(function(data){
        let findidx= state.postArr.findIndex((p)=> p.id===update_id);
        state.postArr[findidx]=updated_obj;
        let col= document.getElementById(update_id);
        col.innerHTML=`
                 <div class="card h-100">
               <div class="card-header bg-dark text-white">
                 <h3>${updated_obj.title}</h3>
               </div>
               <div class="card-body content">
                  <p>${updated_obj.post}</p>
               </div>
               <div class="card-footer d-flex bg-dark text-white justify-content-between">
                  <button onclick="onedithand(this)" class="btn btn-info">Edit</button>
                  <button onclick="ondelete(this)" class="btn btn-warning">Delete</button>
               </div>
            </div>`
            post_form.reset();
                addpostbtn.classList.remove("d-none")
                updatepostbtn.classList.add("d-none")
                snackbar(`Your post with id ${update_id} updated successfully`);
            
    }).catch(function(err){
        cl(err)
    }).finally(()=>{
        spinnerhand()
    })
}



// posts delete functionality.....

function ondelete(ele){
Swal.fire({
  title: "Are you sure?",
  text: "You want to delete this post!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed){
      spinnerhand(true)
   let dlt_id= ele.closest(".col-md-3").id;
   let dlt_url = `${base_url}/posts/${dlt_id}.json`;
      fetch(dlt_url,{
    method:"DELETE",
    body:null,
    headers:{
        "content-type":"application json",
        "auth":"JWT token"
    }
   }).then(function(res){
     if(!res.ok){
        throw new Error("err")
     }
     return res.json()
   }).then(function(data){
       let findidx= state.postArr.findIndex((p)=> p.id===dlt_id);
       state.postArr.splice(findidx,1);
       ele.closest(".col-md-3").remove();
       snackbar(`Your todo with id ${dlt_id} is deleted successfully`)   
   }).catch(function(err){
      cl(err)
   }).finally(()=>{
     spinnerhand()
   })

  }
});

   
}





updatepostbtn.addEventListener("click",onupdatehand)
post_form.addEventListener("submit",onsubmit);