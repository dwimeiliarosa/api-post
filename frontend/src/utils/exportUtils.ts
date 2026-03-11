import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data: any[]) => {
  // Kita petakan data agar judul kolomnya rapi di Excel
  const worksheetData = data.map((post, index) => ({
    No: index + 1,
    "Nama Produk": post.judul,
    Kategori: post.category?.name || post.category_name || "-",
    "Tipe Kulit": post.suitable_for || "-",
    Deskripsi: post.isi,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Produk");
  
  // Download file
  XLSX.writeFile(workbook, `Laporan_GlowUp_Space_${new Date().toLocaleDateString()}.xlsx`);
};

export const exportToPDF = (data: any[]) => {
  const doc = new jsPDF();

  doc.text("Laporan Data Produk GlowUp.Space", 14, 15);
  doc.setFontSize(10);
  doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 22);

  const tableColumn = ["No", "Nama Produk", "Kategori", "Tipe Kulit", "Deskripsi"];
  const tableRows = data.map((post, index) => [
    index + 1,
    post.judul,
    post.category?.name || post.category_name || "-",
    post.suitable_for || "-",
    post.isi,
  ]);

  autoTable(doc, {
    startY: 30,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [150, 126, 250] }, // Warna ungu sesuai tema kamu
  });

  doc.save(`Laporan_GlowUp_Space_${new Date().toLocaleDateString()}.pdf`);
};