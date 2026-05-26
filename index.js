// --- Sunshine Washes Web Logic ---

document.addEventListener('DOMContentLoaded', () => {
  // 1. Shrinking Header on Scroll
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Drawer Navigation
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');
  
  if (menuToggle && mobileOverlay) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileOverlay.classList.toggle('open');
      
      // Animate hamburger lines
      const spans = menuToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
    
    // Close overlay on link click
    mobileOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileOverlay.classList.remove('open');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // 3. Accordion / FAQ Fallback (Web Guidance check)
  if (!('onbeforematch' in HTMLElement.prototype)) {
    // Unsupported browser fallback for hidden=until-found
    document.querySelectorAll('[hidden="until-found"]').forEach((el) => {
      el.removeAttribute('hidden');
    });
  }

  // 4. Locations Geolocation & Finder Logic
  const locations = [
    {
      id: 'clearwater',
      name: 'Clearwater Express',
      address: '2300 Gulf to Bay Blvd, Clearwater, FL 33765',
      phone: '(727) 555-0190',
      hours: 'Mon-Sun: 7:00 AM - 8:00 PM',
      lat: 27.9602,
      lng: -82.7423,
      status: 'Open',
      amenities: ['Free Vacuums', 'Microfiber Towels', 'Dash Wipes', 'Air Guns', 'Mat Cleaner']
    },
    {
      id: 'largo',
      name: 'Largo Wash Center',
      address: '12300 Seminole Blvd, Largo, FL 33778',
      phone: '(727) 555-0245',
      hours: 'Mon-Sun: 7:00 AM - 8:00 PM',
      lat: 27.8864,
      lng: -82.7845,
      status: 'Open',
      amenities: ['Free Vacuums', 'Microfiber Towels', 'Air Guns', 'Tire Shine Station']
    },
    {
      id: 'temple-terrace',
      name: 'Temple Terrace Express',
      address: '9200 N 56th St, Temple Terrace, FL 33617',
      phone: '(813) 555-0312',
      hours: 'Mon-Sun: 7:00 AM - 8:00 PM',
      lat: 28.0319,
      lng: -82.3951,
      status: 'Open',
      amenities: ['Free Vacuums', 'Microfiber Towels', 'Dash Wipes', 'Mat Cleaner']
    }
  ];

  const locListContainer = document.getElementById('locations-list');
  const locSearchInput = document.getElementById('location-search');
  const gpsBtn = document.getElementById('gps-locate');

  if (locListContainer) {
    // Render Location Items
    const renderLocations = (listToRender) => {
      locListContainer.innerHTML = '';
      if (listToRender.length === 0) {
        locListContainer.innerHTML = '<div class="loc-item-title" style="padding:20px;">No locations found matching your search.</div>';
        return;
      }
      
      listToRender.forEach((loc, index) => {
        const item = document.createElement('div');
        item.className = `loc-item ${index === 0 ? 'active' : ''}`;
        item.dataset.id = loc.id;
        item.innerHTML = `
          <h3 class="loc-item-title">${loc.name}</h3>
          <p class="loc-item-address">${loc.address}</p>
          <div class="loc-item-meta">
            <span class="loc-status open">${loc.status}</span>
            <span class="loc-distance" style="font-weight:600; font-size:0.85rem; color:var(--text-muted);">
              ${loc.distance !== undefined ? `${loc.distance.toFixed(1)} miles` : ''}
            </span>
          </div>
        `;
        
        item.addEventListener('click', () => {
          document.querySelectorAll('.loc-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');
          updateMap(loc);
        });
        
        locListContainer.appendChild(item);
      });
      
      // Default to show map for first item
      if (listToRender.length > 0) {
        updateMap(listToRender[0]);
      }
    };

    // Calculate Distance using Haversine formula
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 3958.8; // Radius of Earth in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Update Map Mock Representation (Visual Placeholder helper since we don't have active keys)
    const updateMap = (loc) => {
      const mapContainer = document.getElementById('map-view');
      if (mapContainer) {
        mapContainer.innerHTML = `
          <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#E2E8F0; padding:24px; text-align:center;">
            <svg style="width:64px; height:64px; fill:var(--primary-navy); margin-bottom:16px;" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <h3 style="margin-bottom:8px;">${loc.name}</h3>
            <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:16px; max-width:300px;">${loc.address}</p>
            <p style="font-weight:700; margin-bottom:8px;">Hours: ${loc.hours}</p>
            <p style="font-weight:700; margin-bottom:16px;">Phone: ${loc.phone}</p>
            <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:24px;">
              ${loc.amenities.map(am => `<span style="background:rgba(255,210,0,0.15); color:var(--primary-navy); padding:4px 10px; border-radius:100px; font-size:0.8rem; font-weight:700;">${am}</span>`).join('')}
            </div>
            <a href="https://maps.google.com/?q=${encodeURIComponent(loc.address)}" target="_blank" class="btn btn-primary btn-sm">Get Directions</a>
          </div>
        `;
      }
    };

    // Filter list on search input
    if (locSearchInput) {
      locSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = locations.filter(loc => 
          loc.name.toLowerCase().includes(query) || 
          loc.address.toLowerCase().includes(query)
        );
        renderLocations(filtered);
      });
    }

    // Geolocation Finder trigger
    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
          gpsBtn.textContent = 'Locating...';
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              gpsBtn.textContent = 'Use GPS';
              const userLat = pos.coords.latitude;
              const userLng = pos.coords.longitude;
              
              // Calculate distances
              const locatedList = locations.map(loc => {
                return {
                  ...loc,
                  distance: getDistance(userLat, userLng, loc.lat, loc.lng)
                };
              });
              
              // Sort by distance ascending
              locatedList.sort((a, b) => a.distance - b.distance);
              renderLocations(locatedList);
            },
            () => {
              gpsBtn.textContent = 'Use GPS';
              alert('Unable to retrieve your location. Showing all branches.');
              renderLocations(locations);
            }
          );
        } else {
          alert('Geolocation is not supported by your browser.');
        }
      });
    }

    // Initial Render
    renderLocations(locations);

    // Check URL Parameters on Locations page load to auto-trigger search or GPS
    const urlParams = new URLSearchParams(window.location.search);
    const searchVal = urlParams.get('search');
    const gpsVal = urlParams.get('gps');

    if (searchVal && locSearchInput) {
      locSearchInput.value = searchVal;
      const event = new Event('input', { bubbles: true });
      locSearchInput.dispatchEvent(event);
    }

    if (gpsVal === 'true' && gpsBtn) {
      setTimeout(() => {
        gpsBtn.click();
      }, 300);
    }
  }

  // 5. Connect Hero Search and GPS buttons to the locations page
  const heroSearchInput = document.getElementById('hero-location-search');
  const heroGpsBtn = document.getElementById('hero-gps-locate');
  const heroForm = document.getElementById('hero-locator-form');

  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const zipVal = heroSearchInput ? heroSearchInput.value.trim() : '';
      if (zipVal) {
        window.location.href = `locations.html?search=${encodeURIComponent(zipVal)}`;
      } else {
        window.location.href = 'locations.html';
      }
    });
  }

  if (heroGpsBtn) {
    heroGpsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'locations.html?gps=true';
    });
  }
});
