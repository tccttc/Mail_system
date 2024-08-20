document.addEventListener('DOMContentLoaded', function() {

  // The id are in inbox.html
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Function for submission (Sending Emails)
  document.querySelector("#compose-form").addEventListener('submit', function(event){
    event.preventDefault();
    send_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function view_email(id, mailbox){
  // Show compose view and hide the emails-view and compose-view
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  if (document.querySelector("#emails-detail")) {
    document.querySelector("#emails-detail").style.display = "block";
  }

  // make a get request to the email
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      // Print email
      console.log(email);

      // If the email is not archived, show the button Archive
      archive_value = !email.archived ? "Archive" : "Unarchive";
      // different highlights for the button
      archive_class = email.archived ? "btn btn-success" : "btn btn-danger";

      const emails_detail = document.querySelector("#emails-detail");


      // pass email.archived instead of archive_value (which is for adjusting the button display only)
      // How the archived stuff get done is controlled by the backend!
      emails_detail.innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"> <strong>From:</strong> ${email.sender}</li>
        <li class="list-group-item"> <strong>To:</strong> ${email.recipients}</li>
        <li class="list-group-item"> <strong>Subject:</strong> ${email.subject}</li>
        <li class="list-group-item"> <strong>Timestamp:</strong> ${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>

      <button class="${archive_class}" id="archive_btn" onclick="archive_email(${email.id}, ${email.archived});">${archive_value}</button>
      <button class="btn btn-info" id="reply_btn" onclick="reply_email(${email.id});">Reply</button>
      `;

      // change to read status
      if (mailbox === "inbox") {
        fetch(`/emails/${email.id}`, {
          method: "PUT",
          body: JSON.stringify({
            read: true,
          }),
        });
      }
    });
}

function archive_email(id, archived){

  // ------- Archiving / unarchiving email

  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !archived // The archive status should be changing
    }),
  })
  // Check later... did you already put it into the archive page?
  .then( () => {

    //load_mailbox('archive')
    load_mailbox('inbox')

  }) //redirect to the archived

  // show in archive panel
  // emails_detail.style.display = "block";
}; 


function reply_email (id){

  // ----- Reply button
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {  
    compose_email();

    const re = email.subject.slice(0, 2) === 'Re' ? '' : 'Re: ';
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = re + email.subject;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  })

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-detail').style.display = 'none'; 
  document.querySelector('#compose-view').style.display = 'none';


  // show the mailbox name:
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // make a GET request to /emails/<mailbox> to request the emails
  fetch(`/emails/${mailbox}`) // The argument is going to be substituted in the path. Use backticks!
  .then((response) => response.json())
  .then((emails) => {

    // Print emails in the console
    console.log(emails);

      // Loop through emails and create div for every email
      emails.forEach(email => {

      console.log(email);
      const newEmail = document.createElement("div");

      // innerHTML content
      newEmail.innerHTML = `
        <strong class="pr-2">${email.sender}</strong> ${email.subject} <span class="ml-auto">${email.timestamp}</span>
      `;

      // changing background color
      
      //newEmail.className = "list-group-item"; 
      // 'read' is an name clash
      newEmail.className = email.read ? '_read': '_unread';

      // Click event, will mark the email read 
      newEmail.addEventListener("click", function(){
        view_email(email.id, mailbox)
      });

      // Select the emails-view and append the email
      document.querySelector("#emails-view").append(newEmail);
      
      // Show a message if the mailbox is empty
      if (emails.length === 0) {
      div = document.createElement('div');
      div.innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)} is empty!`;
      div.classList.add('border', 'p-2', 'text-center', 'bg-light');
      emails_div.append(div);
      document.querySelector("#emails-view").append(newEmail);
    }

    })

  });
}

function send_email(event){

  event.preventDefault(); // prevent some auto-checking, cancel the default action
  console.log("test")

  // in chrome console, we can try to type document.querySelector("#compose-body").value; to check what is extracted

  // fetching the message
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
        // Retrieve the fields and the emails using query selector
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
    load_mailbox('sent'); // redirect the page to load_mailbox
  });
}
