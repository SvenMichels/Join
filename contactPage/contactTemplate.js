export function singleContact(fullContactName, emailAddress, phoneNumber, contactInitials, contactId, contactColorClass) {
  return `
<div id = "bigContactCard">
            <div class="closeSingleMobile" id="closeSingleMobile">
              <img src="../assets/icons/arrow-left-line.svg" alt="">
            </div>
            <div class="profileHeader">
              <div class="profilePic ${contactColorClass}">${contactInitials}</div>
              <div class="nameBtns">
                <p id="profileName" class="profileName">${fullContactName}</p>
                <div class="btns">
                  <p id="edit" class="editBtn" data-id="${contactId}">
                    <img src="../assets/icons/edit.svg" alt="" />Edit
                  </p>
                  <p id="delete" class="deleteBtn" data-id="${contactId}">
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
                  <p id="eMail" class="emailAdress">${emailAddress}</p>
                </div>
                <div class="numberContainer">
                  <p class="phone">Phone</p>
                  <p class="phoneNumber">${phoneNumber}</p>
                </div>
              </div>
            </div>
</div>
    <div class="fab-container" id="fabContainer">
      <button class="fab-btn"   id="fabToggle">⋮</button>
      <div   class="fab-menu"   id="fabMenu">
        <p class="fab-menu-item" id="fabEdit"   data-id="${contactId}">
          <img src="../assets/icons/edit.svg" alt="" /> Edit
        </p>
        <p class="fab-menu-item" id="fabDelete" data-id="${contactId}">
          <img src="../assets/icons/delete.svg" alt="" /> Delete
        </p>
      </div>
    </div>
`;
}

export function alphabetfilter(alphabetLetter){
    return`
      <div class="startLetter">${alphabetLetter}</div>
          <div class="stripe"></div>`
}

export function contactCard(fullContactName, emailAddress, contactInitials, contactId, contactColorClass){
    return` <div class="contact" data-id="${contactId}">
              <div class="pic ${contactColorClass}">${contactInitials}</div>
              <div class="nameAdressContainer">
                <div id="profileName" class="contactName">${fullContactName}</div>
                <div class="email">${emailAddress}</div>
              </div>
            </div>`
}