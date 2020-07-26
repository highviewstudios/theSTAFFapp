(this.webpackJsonpstaff=this.webpackJsonpstaff||[]).push([[0],{62:function(e,a,t){e.exports=t(96)},67:function(e,a,t){},92:function(e,a,t){},96:function(e,a,t){"use strict";t.r(a);var n=t(0),l=t.n(n),r=t(23),c=t.n(r),o=(t(67),t(11)),u=t(14),s=t.n(u),m=t(5),i=function(e){return{type:"USER_UPDATE_AUTH",value:e}},E=function(e){return{type:"USER_UPDATE_NAME",value:e}},d=function(e){return{type:"USER_UPDATE_ROLE",value:e}},b=function(e){return{type:"USER_UPDATE_NEW",value:e}},g=function(e){return{type:"USER_UPDATE_REQUESTEDPASSWORD",value:e}},f=function(e){return{type:"USER_UPDATE_ORGID",value:e}},p=(t(89),t(90),t(91),t(92),t(100)),h=t(59),v="";var O=function(){var e=window.location.hostname,a=window.location.protocol;v="localhost"===e?a+"//"+e+":8080":a+"//"+e},w=t(13),j=t(25),N=t(6);var P=function(){var e=Object(w.f)(),a=Object(m.c)((function(e){return e.user})),t=Object(m.b)(),r=Object(n.useState)({name:"",show:!1}),c=Object(o.a)(r,2),u=c[0],p=c[1];function h(){s.a.get("/logout").then((function(n){if(console.log(n.data.message),"User logged out"===n.data.message){console.log(a),t(i(!1)),t(E("")),t(d("")),t(b("")),t(g(!1));var l=a.orgID;t(f("")),e.push("/org/"+l+"/signIn")}})).catch((function(e){console.log(e)}))}return Object(n.useEffect)((function(){O()}),[]),Object(n.useEffect)((function(){a.auth?"superAdmin"==a.role?p({name:"High-View Studios",show:!0}):p({name:a.name,show:!0}):p({name:"",show:!1})}),[a]),l.a.createElement("div",null,u.show?l.a.createElement("div",null,l.a.createElement("strong",null,"User: ",u.name),l.a.createElement("br",null),"seniorAdmin"==a.role?l.a.createElement("div",null,l.a.createElement(j.a,null,l.a.createElement(j.a.Toggle,{variant:"warning",id:"dropdown-basic"},"Page"),l.a.createElement(N.a,{variant:"warning",onClick:h},"Log Out"),l.a.createElement(j.a.Menu,null,l.a.createElement(j.a.Item,{onClick:function(){return e.push("/")}},"Organisation Home"),l.a.createElement(j.a.Item,{onClick:function(){return e.push("/org/"+a.orgID+"/organisationAdmin")}},"Organisation Admin")))):l.a.createElement("div",null,l.a.createElement(N.a,{variant:"warning",onClick:h},"Log Out"))):l.a.createElement("div",null))};var y=function(){return l.a.createElement("nav",null,l.a.createElement(p.a,null,l.a.createElement(h.a,null),l.a.createElement(h.a,null,l.a.createElement("h1",null,l.a.createElement("strong",null,"My STAFF")),l.a.createElement("h2",null,l.a.createElement("strong",null,"Space, Times, Flexible, Facilities"))),l.a.createElement(h.a,null,l.a.createElement("div",{className:"user-nav"},l.a.createElement(P,null)))))},A=t(8),S=t(9);var _=function(){var e=Object(m.c)((function(e){return e.user})),a=Object(w.f)();return Object(n.useEffect)((function(){document.title="STAFF",console.log(e),1==e.auth&&("superAdmin"==e.role?a.push("/administrator"):a.push("/org/"+e.orgID))}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{fluid:!0,className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h1",null,"Home"))))};var I=function(e){var a=e.match.params.id,t=(Object(m.c)((function(e){return e.user})),Object(m.c)((function(e){return e.organisation}))),r=Object(w.f)(),c=Object(m.b)(),u=Object(n.useState)(""),p=Object(o.a)(u,2),h=p[0],j=p[1];return Object(n.useEffect)((function(){document.title="STAFF - Sign In",O()}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h1",null,t.name)," ",l.a.createElement("br",null),l.a.createElement("h3",null,"Please Sign In!"),"true"==t.signInLocal?l.a.createElement("div",null,l.a.createElement("form",null,l.a.createElement("label",{id:"lblEmail"},"Email:"),l.a.createElement("br",null),l.a.createElement("input",{id:"txtEmail",type:"email"}),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("label",{id:"lblPassword"},"Password:"),l.a.createElement("br",null),l.a.createElement("input",{id:"txtPassword",type:"password"}),l.a.createElement("br",null)," ",l.a.createElement("br",null),l.a.createElement("p",null,h)),l.a.createElement("br",null),l.a.createElement(N.a,{variant:"warning",onClick:function(e){e.preventDefault();var t=document.getElementById("txtEmail").value,n=document.getElementById("txtPassword").value;s.a.get("/login?email="+t+"&password="+n).then((function(e){console.log(e.data),"Logged in successful"===e.data.message?(c(i(!0)),c(E(e.data.displayName)),c(d(e.data.role)),c(b(e.data.new)),c(g(e.data.requestedPassword)),c(f(e.data.orgID)),"true"==e.data.new?r.push("createPassword"):r.push("/org/"+a)):j(e.data.info)})).catch((function(e){console.log(e)}))}},"Log in"),l.a.createElement(N.a,{variant:"warning",onClick:function(){return r.push("/org/"+a+"/forgotPassword")}},"Forgot Password"),l.a.createElement("br",null),l.a.createElement("br",null)):l.a.createElement("div",null),"true"==t.signInGoogle?l.a.createElement(N.a,{variant:"danger",href:v+"/auth/google"},l.a.createElement("i",{className:"fab fa-google"})," Log in with Google"):l.a.createElement("div",null))))};var C=function(e){var a=e.match.params.id,t=Object(w.f)(),r=Object(n.useState)(""),c=Object(o.a)(r,2),u=c[0],i=c[1],E=Object(m.b)();return Object(n.useEffect)((function(){document.title="STAFF"}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h1",null,"Hello, and welcome to My STAFF"),l.a.createElement("h3",null,"Please create a new password"),l.a.createElement("form",null,l.a.createElement("label",{id:"lblCurrentPassword"},"Current Password:"),l.a.createElement("br",null),l.a.createElement("input",{id:"txtCurrentPassword",type:"password",required:!0}),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("label",{id:"lblNewPassword"},"New Password:"),l.a.createElement("br",null),l.a.createElement("input",{id:"txtNewPassword",type:"password",required:!0}),l.a.createElement("br",null)," ",l.a.createElement("br",null),l.a.createElement("label",{id:"lblConfirmPassword"},"Confirm Password:"),l.a.createElement("br",null),l.a.createElement("input",{id:"txtConfirmPassword",type:"password",required:!0}),l.a.createElement("br",null)," ",l.a.createElement("br",null),l.a.createElement("p",null,u),l.a.createElement(N.a,{type:"submit",variant:"warning",onClick:function(e){e.preventDefault();var n=document.getElementById("txtCurrentPassword").value,l=document.getElementById("txtNewPassword").value,r=document.getElementById("txtConfirmPassword").value;if(""!=n&&""!=l&&""!=r){var c={oldPassword:n,newPassword:l,confirmPassword:r};s.a.post("/createPassword",c).then((function(e){"Yes"==e.data.userError?i(e.data.message):"Updated user first password"==e.data.message&&(E(b(e.data.user.new)),t.push("/org/"+a))})).catch((function(e){console.log(e)}))}}},"Set Password"),l.a.createElement("br",null),l.a.createElement("br",null)),l.a.createElement("br",null))))},k=t(10);var T=function(e){var a=e.match.params.id,t=Object(w.f)(),r=Object(n.useState)(""),c=Object(o.a)(r,2),u=c[0],i=c[1],E=Object(n.useState)(!1),d=Object(o.a)(E,2),b=d[0],g=d[1];return Object(m.b)(),Object(n.useEffect)((function(){document.title="STAFF"}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h1",null,"Forgot your password?"),b?l.a.createElement("div",null,l.a.createElement("h3",null,"Your new password has been requested, please check your email"),l.a.createElement(N.a,{variant:"warning",onClick:function(){return t.push("/org/"+a+"/signIn")}},"Back to Sign In"),l.a.createElement("br",null),l.a.createElement("br",null)):l.a.createElement("div",null,l.a.createElement("h3",null,"Please enter your email below:"),l.a.createElement("br",null),l.a.createElement("form",null,l.a.createElement(k.a.Control,{id:"txtEmail",type:"email",required:!0}),l.a.createElement("br",null)," ",l.a.createElement("br",null),l.a.createElement("p",null,u),l.a.createElement(N.a,{type:"submit",variant:"warning",onClick:function(e){e.preventDefault();var a=document.getElementById("txtEmail").value;if(""!=a){var t={email:a};s.a.post("/requestPassword/",t).then((function(e){"Yes"==e.data.userError?i(e.data.message):g(!0)})).catch((function(e){console.log(e)}))}}},"Request New Password"),l.a.createElement("br",null),l.a.createElement("br",null)),l.a.createElement("br",null)))))};var D=function(e){var a=e.match.params.id,t=Object(w.f)(),r=Object(n.useState)(""),c=Object(o.a)(r,2),u=c[0],i=c[1],E=Object(m.b)();return Object(n.useEffect)((function(){document.title="STAFF"}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h1",null,"Please create a new password"),l.a.createElement("form",null,l.a.createElement("label",{id:"lblCurrentPassword"},"Current Password:"),l.a.createElement("br",null),l.a.createElement("input",{id:"txtCurrentPassword",type:"password",required:!0}),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("label",{id:"lblNewPassword"},"New Password:"),l.a.createElement("br",null),l.a.createElement("input",{id:"txtNewPassword",type:"password",required:!0}),l.a.createElement("br",null)," ",l.a.createElement("br",null),l.a.createElement("label",{id:"lblConfirmPassword"},"Confirm Password:"),l.a.createElement("br",null),l.a.createElement("input",{id:"txtConfirmPassword",type:"password",required:!0}),l.a.createElement("br",null)," ",l.a.createElement("br",null),l.a.createElement("p",null,u),l.a.createElement(N.a,{type:"submit",variant:"warning",onClick:function(e){e.preventDefault();var n=document.getElementById("txtCurrentPassword").value,l=document.getElementById("txtNewPassword").value,r=document.getElementById("txtConfirmPassword").value;if(""!=n&&""!=l&&""!=r){var c={oldPassword:n,newPassword:l,confirmPassword:r};s.a.post("/changePassword",c).then((function(e){"Yes"==e.data.userError?i(e.data.message):"Updated user password"==e.data.message&&(E(g(e.data.user.requestedPassword)),t.push("/org/"+a))})).catch((function(e){console.log(e)}))}}},"Set Password"),l.a.createElement("br",null),l.a.createElement("br",null)),l.a.createElement("br",null))))};var U=function(e){var a=e.match.params.id,t=(Object(m.c)((function(e){return e.user})),Object(w.f)());return Object(n.useEffect)((function(){document.title="STAFF - Not Connected"}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h3",null,"Sorry, this is not your organisation"),l.a.createElement("br",null)," ",l.a.createElement("br",null),l.a.createElement(N.a,{variant:"warning",onClick:function(){return t.push("/org/"+a)}},"Back to my organisation"),l.a.createElement("br",null),l.a.createElement("br",null))))};var R=function(){var e=Object(m.c)((function(e){return e.user})),a=Object(w.f)();return Object(n.useEffect)((function(){document.title="STAFF - Not Connected",O(),e.auth&&a.push("/")}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h3",null,"Email is not connected to any organisation"),l.a.createElement(N.a,{variant:"warning",onClick:function(){return a.push("/")}},"Back to Home"),l.a.createElement("br",null),l.a.createElement("br",null))))};var x=function(e){var a=e.match.params.id,t=(Object(m.c)((function(e){return e.user})),Object(w.f)());return Object(n.useEffect)((function(){document.title="STAFF - Not Connected",O()}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h3",null,"This is not the login method you use to log in"),l.a.createElement(N.a,{variant:"warning",onClick:function(){return t.push("/org/"+a+"/")}},"Back"),l.a.createElement("br",null),l.a.createElement("br",null))))};var L=function(){return Object(m.c)((function(e){return e.user})),Object(w.f)(),Object(n.useEffect)((function(){document.title="STAFF"}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{fluid:!0,className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h1",null,"Organisation Admin"))))};var F=function(e){var a=e.match.params.id,t=Object(m.c)((function(e){return e.user})),r=Object(n.useState)(""),c=Object(o.a)(r,2),u=c[0],i=c[1],E=Object(w.f)(),d=Object(m.b)();return Object(n.useEffect)((function(){document.title="STAFF",function(){var e="/organisation/"+a;s.a.get(e).then((function(e){"Yes"!=e.data.userError?(d({type:"ORG_UPDATE_NAME",value:e.data.organisation.name}),d(function(e){return{type:"ORG_UPDATE_SIGNIN_LOCAL",value:e}}(e.data.organisation.auth_Local)),d(function(e){return{type:"ORG_UPDATE_SIGNIN_GOOGLE",value:e}}(e.data.organisation.auth_Google)),0==t.auth?E.push("/org/"+a+"/signIn"):t.orgID!=a?E.push("/org/"+t.orgID+"/wrongOrganisation"):"true"==t.requestedPassword?E.push("/org/"+a+"/changePassword"):"true"==t.new?E.push("/org/"+a+"/createPassword"):(console.log(e.data.organisation),i(e.data.organisation.name))):E.push("/")})).catch((function(e){console.log(e)}))}()}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{fluid:!0,className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h1",null,"Organisation Home"),l.a.createElement("h3",null,u))))},G=t(33);var B=function(e){return l.a.createElement("div",null,l.a.createElement(G.a,{body:!0,className:"Organisations-ListBox"},l.a.createElement(p.a,null,l.a.createElement(h.a,null,l.a.createElement("label",null,e.name)),l.a.createElement(h.a,null,l.a.createElement("label",null,e.email)),l.a.createElement(h.a,null,l.a.createElement("label",null,e.poc)),l.a.createElement(h.a,null,l.a.createElement("label",null,e.id)))))};var q=function(){var e=Object(w.f)(),a=Object(n.useState)(!1),t=Object(o.a)(a,2),r=t[0],c=t[1],u=Object(n.useState)([]),m=Object(o.a)(u,2),i=m[0],E=m[1];return Object(n.useEffect)((function(){s.a.get("/organisation/all").then((function(e){E(e.data),c(!0)})).catch((function(e){console.log(e)}))}),[]),l.a.createElement("div",null,l.a.createElement("div",{className:"AH-AddOrganisationBtn"},l.a.createElement(N.a,{variant:"warning",onClick:function(){return e.push("/administrator/organisationRegister")}},"Add Organisation")),l.a.createElement("br",null),r?l.a.createElement("div",null,l.a.createElement(G.a,{body:!0,className:"Organisations-ListTitles"},l.a.createElement(p.a,null,l.a.createElement(h.a,null,l.a.createElement("label",null,"Name")),l.a.createElement(h.a,null,l.a.createElement("label",null,"Email")),l.a.createElement(h.a,null,l.a.createElement("label",null,"Point of Contact")),l.a.createElement(h.a,null,l.a.createElement("label",null,"Unquie URL")))),l.a.createElement("br",null),i.map((function(e,a){return l.a.createElement("div",{key:a},l.a.createElement(B,{name:e.name,email:e.POC_Email,poc:e.POC_Name,id:e.url}),l.a.createElement("br",null))}))):l.a.createElement("div",null))};var H=function(){var e=Object(w.f)(),a=Object(m.c)((function(e){return e.user}));return a.auth&&"superAdmin"==a.role||e.push("/administrator/signIn"),Object(n.useEffect)((function(){document.title="STAFF - Administrator"}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{fluid:!0,className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement(q,null))))};var M=function(){var e=Object(n.useState)(!0),a=Object(o.a)(e,2),t=a[0],r=a[1],c=Object(m.c)((function(e){return e.user})),u=Object(w.f)();return Object(n.useEffect)((function(){O(),c.auth&&("superAdmin"==c.role?u.push("/"):r(!1))}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h1",null,"Administrator Sign In"),t?l.a.createElement("div",null,l.a.createElement("br",null),l.a.createElement(N.a,{variant:"dark",href:v+"/auth/github"},l.a.createElement("i",{class:"fab fa-github"}),"  Log in with Github"),l.a.createElement("br",null),l.a.createElement("br",null)):l.a.createElement("div",null,l.a.createElement("h1",null,"Access Denied")))))};var W=function(){var e=Object(n.useState)(""),a=Object(o.a)(e,2),t=a[0],r=a[1],c=Object(w.f)();return Object(n.useEffect)((function(){document.title="STAFF - Administrator"}),[]),l.a.createElement("div",{className:"body"},l.a.createElement(A.a,{className:"p-3"},l.a.createElement(S.a,{className:"back-color"},l.a.createElement("h1",null,"Organisation Register"),l.a.createElement(k.a,{className:"A-AddOrganisationText"},l.a.createElement(k.a.Row,null,l.a.createElement(k.a.Group,{as:h.a},l.a.createElement(k.a.Label,{id:"lblOrgName"},"Organisation Name:"),l.a.createElement("br",null),l.a.createElement(k.a.Control,{id:"txtOrgName",type:"text",required:!0})),l.a.createElement(k.a.Group,{as:h.a},l.a.createElement(k.a.Label,{id:"lblAlRooms"},"Allocated Rooms:"),l.a.createElement("br",null),l.a.createElement(k.a.Control,{id:"txtAlRooms",type:"text",required:!0}))),l.a.createElement(k.a.Label,{id:"lblAuthTypes"},"Types of Authencation:"),l.a.createElement("br",null),l.a.createElement(k.a.Row,null,l.a.createElement(k.a.Group,{as:h.a},l.a.createElement(k.a.Check,{id:"ckbLocal",type:"checkbox",label:"Local Login"})),l.a.createElement(k.a.Group,{as:h.a},l.a.createElement(k.a.Check,{id:"ckbGoggle",type:"checkbox",label:"Google Login"}))),l.a.createElement(k.a.Label,{className:"A-AddOrganisationTextColor",id:"lblPOC"},"Point of Contact (Senior Admin):"),l.a.createElement("br",null),l.a.createElement(k.a.Row,null,l.a.createElement(k.a.Group,{as:h.a},l.a.createElement(k.a.Label,{id:"lblName"},"Name:"),l.a.createElement("br",null),l.a.createElement(k.a.Control,{id:"txtName",type:"text",required:!0})),l.a.createElement(k.a.Group,{as:h.a},l.a.createElement(k.a.Label,{id:"lblEmail"},"Email:"),l.a.createElement("br",null),l.a.createElement(k.a.Control,{id:"txtEmail",type:"text",required:!0}))),l.a.createElement("p",null,t),l.a.createElement(N.a,{type:"submit",onClick:function(e){e.preventDefault();var a=document.getElementById("txtOrgName").value,t=document.getElementById("txtAlRooms").value,n=document.getElementById("ckbLocal").checked,l=document.getElementById("ckbGoggle").checked,o=document.getElementById("txtName").value,u=document.getElementById("txtEmail").value,m={orgName:a,orgRooms:t,authLocal:n.toString(),authGoogle:l.toString(),pName:o,pEmail:u};s.a.post("/administrator/addOrganisation",m).then((function(e){var a=e.data;"null"!=a.error?console.log(a.message):"Yes"==a.userError?r(a.message):"Successfully added"==a.message&&c.push("/administrator")})).catch((function(e){console.log(e)}))},variant:"warning"},"Register")))))},Y=t(15);var V=function(){var e=Object(m.b)(),a=Object(n.useState)(!1),t=Object(o.a)(a,2),r=t[0],c=t[1];return Object(n.useEffect)((function(){s.a.get("/auth",{withCredentials:!0}).then((function(a){var t=a.data.auth;console.log(a.data),e(i(t)),t&&("superAdmin"==a.data.role?(e(E("High-ViewStudios")),e(d("superAdmin"))):(e(E(a.data.user.displayName)),e(d(a.data.user.role)),e(b(a.data.user.new)),e(g(a.data.user.requestedPassword)),e(f(a.data.user.orgID)))),c(!0)})).catch((function(e){console.log("Authe"+e)}))}),[]),l.a.createElement("div",null,r?l.a.createElement(Y.a,null,l.a.createElement("div",{className:"App"},l.a.createElement(y,null),l.a.createElement(w.c,null,l.a.createElement(w.a,{path:"/",exact:!0,component:_})," ",l.a.createElement(w.a,{path:"/org/:id",exact:!0,component:F}),l.a.createElement(w.a,{path:"/org/:id/signIn",component:I})," ",l.a.createElement(w.a,{path:"/org/:id/forgotPassword",component:T}),l.a.createElement(w.a,{path:"/org/:id/changePassword",component:D}),l.a.createElement(w.a,{path:"/org/:id/createPassword",component:C}),l.a.createElement(w.a,{path:"/org/:id/wrongOrganisation",component:U}),l.a.createElement(w.a,{path:"/org/:id/wrongLogin/",component:x}),l.a.createElement(w.a,{path:"/org/:id/organisationAdmin",component:L}),l.a.createElement(w.a,{path:"/notConnected",component:R}),l.a.createElement(w.a,{path:"/administrator",exact:!0,component:H})," ",l.a.createElement(w.a,{path:"/administrator/signIn",component:M})," ",l.a.createElement(w.a,{path:"/administrator/organisationRegister",component:W})))):l.a.createElement("div",null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var X=t(24),J=t(12),Q=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{auth:!1,name:"",email:"",role:"",new:"",requestedPassword:!1,orgID:""},a=arguments.length>1?arguments[1]:void 0;switch(a.type){case"USER_UPDATE_AUTH":return Object(J.a)(Object(J.a)({},e),{},{auth:a.value});case"USER_UPDATE_NAME":return Object(J.a)(Object(J.a)({},e),{},{name:a.value});case"USER_UPDATE_EMAIL":return Object(J.a)(Object(J.a)({},e),{},{email:a.value});case"USER_UPDATE_ROLE":return Object(J.a)(Object(J.a)({},e),{},{role:a.value});case"USER_UPDATE_NEW":return Object(J.a)(Object(J.a)({},e),{},{new:a.value});case"USER_UPDATE_REQUESTEDPASSWORD":return Object(J.a)(Object(J.a)({},e),{},{requestedPassword:a.value});case"USER_UPDATE_ORGID":return Object(J.a)(Object(J.a)({},e),{},{orgID:a.value});default:return e}},$=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{name:"",signInLocal:!1,signInGoogle:!1},a=arguments.length>1?arguments[1]:void 0;switch(a.type){case"ORG_UPDATE_NAME":return Object(J.a)(Object(J.a)({},e),{},{name:a.value});case"ORG_UPDATE_SIGNIN_LOCAL":return Object(J.a)(Object(J.a)({},e),{},{signInLocal:a.value});case"ORG_UPDATE_SIGNIN_GOOGLE":return Object(J.a)(Object(J.a)({},e),{},{signInGoogle:a.value});default:return e}},z=Object(X.b)({user:Q,organisation:$}),K=Object(X.c)(z,window.__REDUX_DEVTOOLS_EXTENSION__&&window.__REDUX_DEVTOOLS_EXTENSION__());c.a.render(l.a.createElement(m.a,{store:K},l.a.createElement(l.a.StrictMode,null,l.a.createElement(V,null))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[62,1,2]]]);
//# sourceMappingURL=main.cd4baad4.chunk.js.map