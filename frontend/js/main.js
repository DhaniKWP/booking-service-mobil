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

    // Modal Booking
    $("#bookingModal").addClass("hidden");
    $("#openBookingModal").on("click", function () {
      $("#bookingModal").removeClass("hidden").show();
    });
    $("#closeBookingModal").on("click", function () {
      $("#bookingModal").addClass("hidden").hide();
    });
    $(window).on("click", function (e) {
      if (e.target.id === "bookingModal") {
        $("#bookingModal").addClass("hidden").hide();
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
    const phone = $(this).find('input[name="phone"]').val();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone }),
      });

      const result = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Register sukses!",
          text: "Cek email kamu untuk OTP.",
        });
        localStorage.setItem("pending_verification_email", email);
        $("#registerModal").addClass("hidden");
        $("#otpModal").removeClass("hidden");
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Register",
          text: "Register gagal.",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Register",
        text: "Terjadi kesalahan saat register.",
      });
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
        Swal.fire({
          icon: "success",
          title: "OTP Berhasil!",
          text: "Silakan login sekarang.",
        });
        localStorage.removeItem("pending_verification_email");
        $("#otpModal").addClass("hidden");
        $("#loginModal").removeClass("hidden");
      } else {
        Swal.fire({
          icon: "error",
          title: "Verifikasi Gagal",
          text: "OTP salah atau tidak valid.",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Verifikasi Gagal",
        text: "Terjadi kesalahan saat verifikasi OTP.",
      });
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
        Swal.fire({
          icon: "success",
          title: "Login berhasil!",
          text: "Selamat datang!",
          confirmButtonText: "OK",
        }).then(() => {
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));

          if (result.user.role === "admin") {
            window.location.href = "admindashboard.html";
          } else {
            window.location.href = "index.html";
          }
        });
      } else {
        if (result.error.includes("belum diverifikasi")) {
          Swal.fire({
            icon: "warning",
            title: "Belum diverifikasi!",
            text: "Silakan verifikasi OTP terlebih dahulu.",
          });
          localStorage.setItem("pending_verification_email", email); // SIMPAN EMAIL LAGI
          $("#loginModal").addClass("hidden");
          $("#otpModal").removeClass("hidden");
        } else {
          Swal.fire({
            icon: "error",
            title: "Login gagal",
            text: "Email atau password salah.",
          });
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Login gagal",
        text: "Terjadi kesalahan saat login.",
      });
    }
  });

  // ===========================
  // Submit Form Booking
  // ===========================
  $("#bookingForm").submit(async function (e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      Swal.fire({
        icon: "info",
        title: "Login diperlukan",
        text: "Silakan login terlebih dahulu untuk booking.",
      });
      return;
    }

    const serviceType = $(this).find('[name="serviceType"]').val();
    const date = $(this).find('[name="date"]').val();
    const time = $(this).find('[name="time"]').val();
    const notes = $(this).find('[name="notes"]').val();
    const vehicleType = $(this).find('[name="vehicleType"]').val();
    const vehicleYear = $(this).find('[name="vehicleYear"]').val();
    const licensePlate = $(this).find('[name="licensePlate"]').val();

    console.log("DEBUG:", { vehicleType, vehicleYear, licensePlate });

    const estimatedPrice = getEstimatedPrice(vehicleType, serviceType);
    const workshopName = "Wijaya Motor";
    const serviceNumber = `SRV-${Date.now()}`;

    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          serviceType,
          date,
          time,
          notes,
          vehicleType,
          vehicleYear,
          licensePlate,
          estimatedPrice,
          workshopName,
          serviceNumber,
          status: "pending"
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Booking berhasil!",
          timer: 1500,
        });
        $("#bookingForm")[0].reset();
      } else {
        Swal.fire({
          icon: "error",
          title: "Booking gagal",
          text: result.error || "Gagal melakukan booking.",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Booking gagal",
        text: "Terjadi kesalahan saat proses booking.",
      });
    }
  });

  function getEstimatedPrice(vehicle, service) {
    const priceMap = {
      "Toyota Avanza": {
        "Ganti Oli": "Rp400.000 - Rp600.000",
        "Service Ringan": "Rp500.000 - Rp1.200.000",
        "Overhoul": "Rp5.000.000 - Rp8.000.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp350.000",
        "Kaki - Kaki": "Rp500.000 - Rp6.000.000",
      },
      "Daihatsu Xenia": {
        "Ganti Oli": "Rp400.000 - Rp600.000",
        "Service Ringan": "Rp500.000 - Rp1.200.000",
        "Overhoul": "Rp5.000.000 - Rp8.000.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp350.000",
        "Kaki - Kaki": "Rp500.000 - Rp6.000.000"
       },
      "Toyota Kijang Innova": {
        "Ganti Oli": "Rp600.000 - Rp1.000.000",
        "Service Ringan": "Rp800.000 - Rp1.500.000",
        "Overhoul": "Rp6.000.000 - Rp10.000.000",
        "Panggilan Darurat": "Rp250.000 - Rp600.000",
        "Scanning": "Rp200.000 - Rp500.000",
        "Kaki - Kaki": "Rp1.000.000 - Rp7.000.000"
       },
      "Mitsubishi Xpander": {
        "Ganti Oli": "Rp450.000 - Rp650.000",
        "Service Ringan": "Rp600.000 - Rp1.300.000",
        "Overhoul": "Rp5.500.000 - Rp8.500.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp400.000",
        "Kaki - Kaki": "Rp600.000 - Rp6.500.000"
      },
      "Suzuki Ertiga": {
        "Ganti Oli": "Rp450.000 - Rp650.000",
        "Service Ringan": "Rp600.000 - Rp1.300.000",
        "Overhoul": "Rp5.500.000 - Rp8.500.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp400.000",
        "Kaki - Kaki": "Rp600.000 - Rp6.500.000"
      },
      "Toyota Agya": {
        "Ganti Oli": "Rp350.000 - Rp550.000",
        "Service Ringan": "Rp400.000 - Rp1.000.000",
        "Overhoul": "Rp4.500.000 - Rp7.000.000",
        "Panggilan Darurat": "Rp200.000 - Rp450.000",
        "Scanning": "Rp150.000 - Rp300.000",
        "Kaki - Kaki": "Rp500.000 - Rp5.000.000"
      },
      "Daihatsu Ayla": {
        "Ganti Oli": "Rp350.000 - Rp550.000",
        "Service Ringan": "Rp400.000 - Rp1.000.000",
        "Overhoul": "Rp4.500.000 - Rp7.000.000",
        "Panggilan Darurat": "Rp200.000 - Rp450.000",
        "Scanning": "Rp150.000 - Rp300.000",
        "Kaki - Kaki": "Rp500.000 - Rp5.000.000"
      },
      "Honda Brio Satya": {
        "Ganti Oli": "Rp400.000 - Rp600.000",
        "Service Ringan": "Rp500.000 - Rp1.200.000",
        "Overhoul": "Rp5.000.000 - Rp7.500.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp350.000",
        "Kaki - Kaki": "Rp600.000 - Rp5.500.000"
      },
      "Datsun Go/Go+": {
        "Ganti Oli": "Rp350.000 - Rp550.000",
        "Service Ringan": "Rp400.000 - Rp1.000.000",
        "Overhoul": "Rp4.500.000 - Rp7.000.000",
        "Panggilan Darurat": "Rp200.000 - Rp450.000",
        "Scanning": "Rp150.000 - Rp300.000",
        "Kaki - Kaki": "Rp500.000 - Rp5.000.000"
      },
      "Toyota Rush": {
        "Ganti Oli": "Rp450.000 - Rp650.000",
        "Service Ringan": "Rp600.000 - Rp1.300.000",
        "Overhoul": "Rp5.500.000 - Rp8.500.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp400.000",
        "Kaki - Kaki": "Rp600.000 - Rp6.500.000"
      },
      "Daihatsu Terios": {
        "Ganti Oli": "Rp450.000 - Rp650.000",
        "Service Ringan": "Rp600.000 - Rp1.300.000",
        "Overhoul": "Rp5.500.000 - Rp8.500.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp400.000",
        "Kaki - Kaki": "Rp600.000 - Rp6.500.000"
      },
      "Honda CR-V": {
        "Ganti Oli": "Rp600.000 - Rp1.000.000",
        "Service Ringan": "Rp800.000 - Rp1.800.000",
        "Overhoul": "Rp6.500.000 - Rp10.000.000",
        "Panggilan Darurat": "Rp250.000 - Rp600.000",
        "Scanning": "Rp200.000 - Rp500.000",
        "Kaki - Kaki": "Rp1.000.000 - Rp8.000.000"
      },
      "Toyota Fortuner": {
        "Ganti Oli": "Rp700.000 - Rp1.200.000",
        "Service Ringan": "Rp1.000.000 - Rp2.000.000",
        "Overhoul": "Rp7.000.000 - Rp12.000.000",
        "Panggilan Darurat": "Rp300.000 - Rp700.000",
        "Scanning": "Rp250.000 - Rp600.000",
        "Kaki - Kaki": "Rp1.500.000 - Rp9.000.000"
      },
      "Honda Jazz": {
        "Ganti Oli": "Rp450.000 - Rp650.000",
        "Service Ringan": "Rp600.000 - Rp1.300.000",
        "Overhoul": "Rp5.500.000 - Rp8.500.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp400.000",
        "Kaki - Kaki": "Rp600.000 - Rp6.500.000"
      },
      "Toyota Yaris": {
        "Ganti Oli": "Rp450.000 - Rp650.000",
        "Service Ringan": "Rp600.000 - Rp1.300.000",
        "Overhoul": "Rp5.500.000 - Rp8.500.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp400.000",
        "Kaki - Kaki": "Rp600.000 - Rp6.500.000"
      },
      "Suzuki Swift": {
        "Ganti Oli": "Rp450.000 - Rp650.000",
        "Service Ringan": "Rp600.000 - Rp1.300.000",
        "Overhoul": "Rp5.500.000 - Rp8.500.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp400.000",
        "Kaki - Kaki": "Rp600.000 - Rp6.500.000"
      },
      "Toyota Vios": {
        "Ganti Oli": "Rp400.000 - Rp600.000",
        "Service Ringan": "Rp500.000 - Rp1.200.000",
        "Overhoul": "Rp5.000.000 - Rp8.000.000",
        "Panggilan Darurat": "Rp200.000 - Rp500.000",
        "Scanning": "Rp150.000 - Rp350.000",
        "Kaki - Kaki": "Rp600.000 - Rp6.500.000"
      },
      "Honda Civic": {
        "Ganti Oli": "Rp500.000 - Rp800.000",
        "Service Ringan": "Rp700.000 - Rp1.500.000",
        "Overhoul": "Rp6.000.000 - Rp9.000.000",
        "Panggilan Darurat": "Rp250.000 - Rp600.000",
        "Scanning": "Rp200.000 - Rp500.000",
        "Kaki - Kaki": "Rp800.000 - Rp7.500.000"
      },
      "Toyota Corolla Altis": {
        "Ganti Oli": "Rp500.000 - Rp800.000",
        "Service Ringan": "Rp700.000 - Rp1.500.000",
        "Overhoul": "Rp6.000.000 - Rp9.000.000",
        "Panggilan Darurat": "Rp250.000 - Rp600.000",
        "Scanning": "Rp200.000 - Rp500.000",
        "Kaki - Kaki": "Rp800.000 - Rp7.500.000"
      }
    };

    return priceMap[vehicle]?.[service] || "Rp -";
  }

  // ===========================
  // Tampilkan Data Booking User (fix dengan token dan pengecekan DOM)
  // ===========================
  $(document).ready(async function () {
    const container = document.getElementById("booking-card-container");
    if (!container) return; // Kalau tidak di halaman listbooking.html, skip

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !user.email || !token) {
      Swal.fire({
        icon: "info",
        title: "Login diperlukan",
        text: "Silakan login terlebih dahulu untuk melihat daftar booking.",
      }).then(() => {
        window.location.href = "index.html";
      });
      return;
    }

    try {
      const res = await fetch(`/api/bookings/user?email=${user.email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = `<p class="text-center">Belum ada data booking.</p>`;
        return;
      }

      container.innerHTML = data
        .map(
          (b) => `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="booking-user-card p-4 shadow bg-light rounded">
            <h5>${b.workshopName} - ${b.serviceNumber}</h5>
            <p><strong>Nama:</strong> ${b.name}</p>
            <p><strong>No HP:</strong> ${b.phone}</p>
            <p><strong>Mobil:</strong> ${b.vehicleType} (${b.vehicleYear})</p>
            <p><strong>Plat Nomor:</strong> ${b.licensePlate}</p>
            <p><strong>Layanan:</strong> ${b.serviceType}</p>
            <p><strong>Tanggal:</strong> ${b.date}</p>
            <p><strong>Jam:</strong> ${b.time}</p>
            <p><strong>Catatan:</strong> ${b.notes}</p>
            <p><strong>Harga Estimasi:</strong> ${b.estimatedPrice}</p>
            <p><strong>Status:</strong> 
              <span class="${b.status === 'accepted' ? 'text-success' : b.status === 'rejected' ? 'text-danger' : 'text-warning'}">
              ${b.status === 'accepted'
              ? 'Diterima'
              : b.status === 'rejected'
              ? 'Ditolak'
              : b.status === 'completed'
              ? 'Selesai'
              : 'Menunggu Konfirmasi'}
              </span>
            </p>
            ${b.status === 'completed' ? `
            <a href="/api/bookings/${b.id}/invoice" class="btn btn-outline-primary btn-sm mt-2" target="_blank">
              <i class="fas fa-file-pdf"></i> Download Invoice
            </a>
          ` : ''}
          </div>
        </div>
      `
        )
        .join("");
    } catch (err) {
      console.error("Gagal memuat data booking:", err);
      container.innerHTML =
        "<p class='text-center text-danger'>Gagal memuat data booking.</p>";
    }
  });

  // ===========================
  // Tampilkan Data Booking User Untuk admin dom
  // ===========================
    window.updateStatus = async function (id, status) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        Swal.fire("Berhasil!", `Booking ${status === "accepted" ? "diterima" : "ditolak"}.`, "success")
          .then(() => location.reload());
      } else {
        const data = await res.json();
        Swal.fire("Gagal", data.message || "Terjadi kesalahan.", "error");
      }
    } catch (error) {
      console.error("Gagal update status:", error);
      Swal.fire("Gagal", "Terjadi kesalahan saat menghubungi server.", "error");
    }
  };

    window.markAsCompleted = async function (id) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/bookings/${id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (res.ok) {
        Swal.fire("Berhasil!", "Booking ditandai selesai.", "success")
          .then(() => location.reload());
      } else {
        Swal.fire("Gagal", result.message || "Gagal tandai selesai", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Terjadi kesalahan.", "error");
    }
  };



  document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (window.location.pathname.includes("admindashboard.html")) {
        if (!token || !user || user.role !== "admin") {
            Swal.fire({
                icon: "warning",
                title: "Akses ditolak!",
                text: "Kamu tidak punya izin membuka halaman ini.",
            }).then(() => {
                if (!window.location.pathname.includes("index.html")) {
                    window.location.href = "index.html";
                }
            });
            return;
        }

        document.body.classList.remove("protected");

        try {
            const res = await fetch("/api/admin/bookings", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const bookings = await res.json();
            const listContainer = document.getElementById("booking-list");

            if (!Array.isArray(bookings) || bookings.length === 0) {
                listContainer.innerHTML = "<p class='text-center'>Belum ada booking masuk.</p>";
                return;
            }

      listContainer.innerHTML = bookings.map(b => `
        <div class="col-md-6 col-lg-4">
          <div class="booking-card p-4 shadow rounded bg-light">
            <h5 class="text-primary">${b.workshopName} - ${b.serviceNumber}</h5>
            <p><strong>Nama:</strong> ${b.name}</p>
            <p><strong>No HP:</strong> ${b.phone}</p>
            <p><strong>Mobil:</strong> ${b.vehicleType} (${b.vehicleYear})</p>
            <p><strong>Plat Nomor:</strong> ${b.licensePlate}</p>
            <p><strong>Layanan:</strong> ${b.serviceType}</p>
            <p><strong>Tanggal:</strong> ${b.date}</p>
            <p><strong>Jam:</strong> ${b.time}</p>
            <p><strong>Catatan:</strong> ${b.notes || '-'}</p>
            <p><strong>Harga Estimasi:</strong> ${b.estimatedPrice}</p>
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-success btn-sm" onclick="updateStatus(${b.id}, 'accepted')">
                <i class="fas fa-check"></i> Terima
              </button>
              <button class="btn btn-danger btn-sm" onclick="updateStatus(${b.id}, 'rejected')">
                <i class="fas fa-times"></i> Tolak
              </button>
              <button class="btn btn-primary btn-sm" onclick="markAsCompleted(${b.id})">
                <i class="fas fa-flag-checkered"></i> Selesai
              </button>

            </div>
          </div>
        </div>
      `).join("");
    } catch (error) {
            console.error("Gagal memuat data booking:", error);
            document.getElementById("booking-list").innerHTML = "<p class='text-danger'>Terjadi kesalahan saat memuat data.</p>";
        }
    }
});

  // ===========================
  // Setup navbar login/logout
  // ===========================
  function updateNavbar() {
    const user = JSON.parse(localStorage.getItem("user"));

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
