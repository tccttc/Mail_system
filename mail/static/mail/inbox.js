document.addEventListener('DOMContentLoaded', function() {

  // The id are in inbox.html
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Function for submission (Sending Emails)
  document.querySelector("#compose-form").addEventListener('submit', send_email);

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


function view_email(id){

  // make a get request to the email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...
      // Show compose view and hide the emails-view and compose-view
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-detail').style.display = 'block';

      document.querySelector("#emails-detail").innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"> <strong>From:</strong> ${email.sender}</li>
        <li class="list-group-item"> <strong>To:</strong> ${email.recipients}</li>
        <li class="list-group-item"> <strong>Subject:</strong> ${email.subject}</li>
        <li class="list-group-item"> <strong>Timestamp:</strong> ${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>
      `;

      //email.read = false;

      // change to read status
      if(!email.read){
        fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      }

      // ------- Archiving / unarchiving email

      const btn_arch = document.createElement('button');
      btn_arch.innerHTML = email.archived ? "Unarchive" : "Archive";

      // different highlights for the button
      btn_arch.className = email.archived ? "btn btn-success" : "btn btn-danger"

      // set archived = true
      btn_arch.addEventListener("click", function () {
        fetch(`/emails/${email.id}`, {
          method: "PUT",
          body: JSON.stringify({
            // (check later) load-mailbox will handle it
            archived: !email.archived // The archive status should be changing
          }),
        })
        // Check later... did you already put it into the archive page?
        .then( () => load_mailbox('archive')) //redirect to the archived

        // show in archive panel
        document.querySelector('#emails-detail').style.display = 'block';
      }); 
  
      document.querySelector("#emails-detail").append(btn_arch);



      // ----- Reply button
      const btn_reply = document.createElement("button");
      btn_reply.innerHTML = "Reply";
      btn_reply.className = "btn btn-info";
      btn_reply.addEventListener("click", function () {
        console.log("Reply");
        compose_email();
        document.querySelector("#compose-recipients").value = email.sender;

        // sometimes it would be reply for several times, so...
        let subject = email.subject;
        if ((subject.spilt(' ', 1))[0] != "Re"){
          subject = "Re:" + email.subject;
        }
        document.querySelector("#compose-subject").value = subject;       

        // On Jan 1 2020, 12:00 AM foo@example.com wrote:"
        document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

      });
      document.querySelector("#emails-detail").append(btn_reply);

  });

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-detail').style.display = 'block'; // it should shown in archived show
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // make a GET request to /emails/<mailbox> to request the emails
  fetch(`/emails/${mailbox}`) // The argument is going to be substituted in the path. Use backticks!
  .then((response) => response.json())
  .then((emails) => {

    // Print emails in the console
    console.log(emails);

    // Loop through emails and create div for every email
    emails.forEach(singleEmail => {

      console.log(singleEmail);
      const newEmail = document.createElement("div");

      // innerHTML content
      newEmail.innerHTML = `
        <h6>Sender: ${singleEmail.sender}</h6>
        <h5>Subject: ${singleEmail.subject}</h5>
        <p>${singleEmail.timestamp}</p>
      `;

      // changing background color
      
      //newEmail.className = "list-group-item"; 
      // 'read' is an name clash
      newEmail.className = singleEmail.read ? '_read': '_unread';

      // Click event, will mark the email read 
      newEmail.addEventListener("click", function(){
        view_email(singleEmail.id)
      });

      // Select the emails-view and append the email
      document.querySelector("#emails-view").append(newEmail);

    })

  });
}

function send_email(event){

  event.preventDefault(); // prevent some auto-checking, cancel the default action
  console.log("test")

  // in chrome console, we can try to type document.querySelector("#compose-body").value; to check what is extracted

  // Retrieve the fields and the emails
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  // fetching the message
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
    load_mailbox('sent'); // redirect the page to load_mailbox
  });
}


