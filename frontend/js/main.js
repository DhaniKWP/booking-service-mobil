(function ($) {
  "use strict";

  // Spinner
  var spinner = function () {
    setTimeout(function () {
      if ($("#spinner").length > 0) {
        $("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner();

  // Initiate the wowjs
  new WOW().init();

  // Sticky Navbar
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".sticky-top").addClass("shadow-sm").css("top", "0px");
    } else {
      $(".sticky-top").removeClass("shadow-sm").css("top", "-100px");
    }
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });
  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  // Facts counter
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 2000,
  });

  // Header carousel
  $(".header-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    loop: true,
    nav: false,
    dots: true,
    items: 1,
    dotsData: true,
  });

  // Testimonials carousel
  $(".testimonial-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    center: true,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 2,
      },
    },
  });

  // Portfolio isotope and filter
  var portfolioIsotope = $(".portfolio-container").isotope({
    itemSelector: ".portfolio-item",
    layoutMode: "fitRows",
  });
  $("#portfolio-flters li").on("click", function () {
    $("#portfolio-flters li").removeClass("active");
    $(this).addClass("active");

    portfolioIsotope.isotope({ filter: $(this).data("filter") });
  });

  // Modal handlers
  $(document).ready(function () {
    // Pastikan modal tersembunyi saat halaman dimuat
    $("#loginModal").addClass("hidden");
    $("#registerModal").addClass("hidden");

    // Modal Login
    $("#openLoginModal").on("click", function () {
      $("#loginModal").removeClass("hidden");
    });

    $("#closeLoginModal").on("click", function () {
      $("#loginModal").addClass("hidden");
    });

    // Modal Register
    $("#openRegisterFromLogin").on("click", function (e) {
      e.preventDefault();
      $("#loginModal").addClass("hidden");
      $("#registerModal").removeClass("hidden");
    });

    $("#closeRegisterModal").on("click", function () {
      $("#registerModal").addClass("hidden");
    });

    // Modal OTP
    $("#closeOtpModal").on("click", function () {
      $("#otpModal").addClass("hidden");
    });

    $(window).on("click", function (e) {
      if (e.target.id === "otpModal") {
        $("#otpModal").addClass("hidden");
      }
    });

    // Klik luar modal untuk close
    $(window).on("click", function (e) {
      if (e.target.id === "loginModal") {
        $("#loginModal").addClass("hidden");
      }
      if (e.target.id === "registerModal") {
        $("#registerModal").addClass("hidden");
      }
    });
  });

  // ===========================
  // Submit Form Register
  // ===========================
  $("#registerForm").submit(async function (e) {
    e.preventDefault();
    const email = $(this).find('input[name="email"]').val();
    const password = $(this).find('input[name="password"]').val();
    const name = $(this).find('input[name="name"]').val();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Register sukses! Cek email kamu untuk OTP.");
        localStorage.setItem("pending_verification_email", email);
        $("#registerModal").addClass("hidden");
        $("#otpModal").removeClass("hidden");
      } else {
        alert(result.error || "Register gagal.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat register.");
    }
  });

  // ===========================
  // Submit Form OTP
  // ===========================
  $("#otpForm").submit(async function (e) {
    e.preventDefault();
    const otp = $(this).find('input[name="otp"]').val();
    const email = localStorage.getItem("pending_verification_email");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Verifikasi OTP berhasil! Silahkan login.");
        localStorage.removeItem("pending_verification_email");
        $("#otpModal").addClass("hidden");
        $("#loginModal").removeClass("hidden");
      } else {
        alert(result.error || "Verifikasi OTP gagal.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat verifikasi OTP.");
    }
  });

  // ===========================
  // Submit Form Login
  // ===========================
  $("#loginForm").submit(async function (e) {
    e.preventDefault();
    const email = $(this).find('input[name="email"]').val();
    const password = $(this).find('input[name="password"]').val();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Login berhasil!");
        localStorage.setItem("user", JSON.stringify({ email }));
        location.reload();
      } else {
        if (result.error.includes("belum diverifikasi")) {
          alert("Akun belum diverifikasi. Silakan verifikasi OTP.");
          localStorage.setItem("pending_verification_email", email); // SIMPAN EMAIL LAGI
          $("#loginModal").addClass("hidden");
          $("#otpModal").removeClass("hidden");
        } else {
          alert(result.error || "Login gagal.");
        }
      }      
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat login.");
    }
  });

  // ===========================
  // Submit Form Booking
  // ===========================
  $("#bookingForm").submit(async function (e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Silakan login terlebih dahulu untuk booking.");
      return;
    }

    const serviceType = $(this).find('select[name="serviceType"]').val();
    const date = $(this).find('input[name="date"]').val();
    const time = $(this).find('input[name="time"]').val();
    const notes = $(this).find('textarea[name="notes"]').val();

    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          serviceType,
          date,
          time,
          notes
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Booking berhasil!");
        $("#bookingForm")[0].reset();
      } else {
        alert(result.error || "Gagal melakukan booking.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat proses booking.");
    }
  });

  // ===========================
  // Tampilkan Data Booking User
  // ===========================
  $(document).ready(async function () {
    if (window.location.pathname.includes("listbooking.html")) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "index.html";
        return;
      }

      try {
        const res = await fetch(`/api/bookings/user?email=${user.email}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Gagal ambil data");

        if (data.length === 0) {
          $("#bookingTableBody").html("<tr><td colspan='5'>Belum ada data booking.</td></tr>");
        } else {
          $("#bookingTableBody").html(
            data.map((b, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${b.serviceType}</td>
                <td>${b.date}</td>
                <td>${b.time}</td>
                <td>${b.notes}</td>
              </tr>
            `).join("")
          );
        }
      } catch (err) {
        console.error(err);
        $("#bookingTableBody").html("<tr><td colspan='5'>Terjadi kesalahan saat mengambil data.</td></tr>");
      }
    }
  });


  // ===========================
  // Setup navbar login/logout
  // ===========================
  function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('user'));
  
    if (user) {
      // Hilangin tombol login
      $("#openLoginModal").remove();
  
      // Bikin dropdown profile
      const profileHTML = `
        <div class="dropdown ms-3" id="userDropdown">
          <button class="btn btn-light dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-user-circle fa-2x text-primary me-2"></i>
            <span>${user.email}</span>
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Profile</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
          </ul>
        </div>
      `;
  
      // Taruh dropdown setelah navbar menu
      $(".navbar-collapse .navbar-nav").after(profileHTML);
      
    } else {
      // Kalau logout
      if ($("#userDropdown").length) {
        $("#userDropdown").remove();
      }
      $("#openLoginModal").show();
    }
  }
  
  

  // Cek saat halaman load
  $(document).ready(function () {
    updateNavbar();

    // Event logout
    $(document).on("click", "#logoutBtn", function () {
      localStorage.removeItem("user");
      location.reload(); // refresh halaman
    });
  });
})(jQuery);
