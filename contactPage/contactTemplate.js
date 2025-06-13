export function singleContact(name, email, phone, initials, id) {
  return `
<div id = "bigContactCard">
            <div class="profileHeader">
              <div class="profilePic">${initials}</div>
              <div class="nameBtns">
                <p id="profileName" class="profileName">${name}</p>
                <div class="btns">
                  <p id="edit" class="editBtn" data-id="${id}">
                    <img src="../assets/icons/edit.svg" alt="" />Edit
                  </p>
                  <p id="delete" class="deleteBtn" data-id="${id}">
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
}

export function alphabetfilter(letter){
    return`
      <div class="startLetter">${letter}</div>
          <div class="stripe"></div>`
}

export function contactCard(name, email, initials, id){
    return` <div class="contact" data-id="${id}">
              <div class="pic">${initials}</div>
              <div class="nameAdressContainer">
                <div id="profileName" class="contactName">${name}</div>
                <div class="email">${email}</div>
              </div>
            </div>`
}