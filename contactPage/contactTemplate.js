export function singleContact(name, email, phone, initials) {
  return `
<div>
            <div class="profileHeader">
              <div class="profilePic">${initials}</div>
              <div class="nameBtns">
                <p id="profileName" class="profileName">${name}</p>
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
                <p id="eMail" class="emailAdress">${email}</p>
              </div>
              <div class="numberContainer">
                <p class="phone">Phone</p>
                <p class="phoneNumber">${phone}</p>
              </div>
              </div>
            </div>
          </div>`;

          // kommt in singleContact rein
}

export function alphabetfilter(letter){
    return`
      <div class="startLetter">${letter}</div>
          <div class="stripe"></div>`

          //muss in allContacts über contact
}

export function contactCard(name, email, initials){
    return`<div class="contact">
            <div class="pic">${initials}</div>
            <div class="nameAdressContainer">
            <div id="profileName" class="contactName">${name}</div>
            <div class="${email}"</div>
          </div>
            </div>`

            //kommt auch in allcontacts rein aber unter stripe
}