// version

const getVersion = () => {
    const url = "https://cws.auckland.ac.nz/nzsl/api/Version";
    const fetchPromise = fetch(url);
    const streamPromise = fetchPromise.then((response) => response.text());
    streamPromise.then((data) => document.getElementById("version").innerText = data);
}

// logo

const getLogo = () => {
    const url = "https://cws.auckland.ac.nz/nzsl/api/Logo";
    fetch(url).then((response) => response.blob()).then((imageBlob) => {
        const imageUrl = URL.createObjectURL(imageBlob);
        document.getElementById("logo").src = imageUrl;
    });
}

// signs

const loadNZSLSigns = () => {
    const allSignsUrl = "https://cws.auckland.ac.nz/nzsl/api/AllSigns";
    
    fetch(allSignsUrl)
        .then(response => response.json())
        .then(signs => {
            displaySigns(signs);
        })
        .catch(error => console.error('Error fetching signs:', error));
};

const searchSigns = () => {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const signsList = document.getElementById('signsList');

    if (searchTerm.length === 0) {
        signsList.innerHTML = '';
        return;
    }

    const searchUrl = `https://cws.auckland.ac.nz/nzsl/api/Signs/${searchTerm}`;
    
    fetch(searchUrl)
        .then(response => response.json())
        .then(filteredSigns => {
            displaySigns(filteredSigns);
        })
        .catch(error => console.error('Error searching signs:', error));
};

const displaySigns = (signs) => {
    const signsList = document.getElementById('signsList');
    signsList.innerHTML = '';

    signs.forEach(sign => {
        const signItem = document.createElement('div');
        signItem.classList.add('sign-item');
        
        fetchSignImage(sign.id)
            .then(imageUrl => {
                signItem.innerHTML = `
                    <img src="${imageUrl}" alt="${sign.description}" class="sign-image">
                    <p>${sign.description}</p>
                `;
                signsList.appendChild(signItem);
            });
    });
};

const fetchSignImage = (signId) => {
    const signImageUrl = `https://cws.auckland.ac.nz/nzsl/api/SignImage/${signId}`;
    return fetch(signImageUrl)
        .then(response => {
            if (response.ok) {
                return response.url;
            };
        });
};

// events

const getEvents = () => {
    const eventCountUrl = "https://cws.auckland.ac.nz/nzsl/api/EventCount";
    
    fetch(eventCountUrl).then(response => response.text()).then(count => {
            const totalEvents = parseInt(count, 10);
            const eventList = document.getElementById('eventList');
            eventList.innerHTML = '';

            for (let i = 0; i < totalEvents; i++) {
                fetchEvent(i);
            }
        });
};

const fetchEvent = (eventId) => {
    const eventUrl = `https://cws.auckland.ac.nz/nzsl/api/Event/${eventId}`;
    
    fetch(eventUrl).then(response => response.text()).then(vcalData => {
            const eventDetails = parseVCalendar(vcalData);
            displayEvent(eventDetails);
        });
};

const parseVCalendar = (vcalData) => {
    const lines = vcalData.split('\n');
    const eventDetails = {};

    lines.forEach(line => {
        if (line.startsWith('SUMMARY:')) {
            eventDetails.summary = line.replace('SUMMARY:', '').trim();
        }
        if (line.startsWith('DESCRIPTION:')) {
            eventDetails.description = line.replace('DESCRIPTION:', '').trim();
        }
        if (line.startsWith('DTSTART:')) {
            eventDetails.start = line.replace('DTSTART:', '').trim();
        }
        if (line.startsWith('DTEND:')) {
            eventDetails.end = line.replace('DTEND:', '').trim();
        }
        if (line.startsWith('LOCATION:')) {
            eventDetails.location = line.replace('LOCATION:', '').trim();
        }
    });

    return eventDetails;
};

const displayEvent = (eventDetails) => {
    const eventList = document.getElementById('eventList');
    const listItem = document.createElement('li');

    listItem.innerHTML = `
        <h3>${eventDetails.summary}</h3>
        <p>${eventDetails.description}</p>
        <p>Date: ${formatDate(eventDetails.start)} - ${formatDate(eventDetails.end)}</p>
        <p>Location: ${eventDetails.location}</p>
        
    `;
    
    eventList.appendChild(listItem);
};

const formatDate = (vcalDate) => {
    const year = vcalDate.slice(0, 4);
    const month = vcalDate.slice(4, 6);
    const day = vcalDate.slice(6, 8);
    const hours = vcalDate.slice(9, 11);
    const minutes = vcalDate.slice(11, 13);
    const seconds = vcalDate.slice(13, 15);

    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    const date = new Date(formattedDate);

    return date.toLocaleString('en-NZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

window.onload(
    getVersion(), 
    getLogo(),
    getEvents()
);