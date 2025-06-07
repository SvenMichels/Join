function singleContact() {
  return `
<div>
            <div class="profileHeader">
              <div class="profilePic">MK</div>
              <div class="nameBtns">
                <p class="profileName">Marcel Kruck</p>
                <div class="btns">
                  <p class="editBtn">
                    <img src="../assets/icons/edit.svg" alt="" />Edit
                  </p>
                  <p class="deleteBtn">
                    <img src="../assets/icons/delete.svg" alt="" />Delete
                  </p>
                </div>
              </div>
            </div>
            <div class="infoContainer">
            <p class="information">Contact Information</p>
            <div class="mailPhone">
              <div class="emailContainer">
                <p class="email">Email</p>
                <p id="eMail" class="emailAdress">marcel.kruck12@gmx.de</p>
              </div>
              <div class="numberContainer">
                <p class="phone">Phone</p>
                <p class="phoneNumber">+49 17684865614</p>
              </div>
              </div>
            </div>
          </div>`;

          // kommt in singleContact rein
}

function alphabetfilter(){
    return`
      <div class="startLetter">M</div>
          <div class="stripe"></div>`

          //muss in allContacts über contact
}

function contactCard(){
    return`<div class="contact">
            <div class="pic">MK</div>
            <div class="nameAdressContainer">
            <div class="contactName">Marcel Kruck</div>
            <div class="contactEmail">marcel.kruck12@gmx.de</div>
          </div>
            </div>`

            //kommt auch in allcontacts rein aber unter stripe
}