﻿$(function () {

    PublicLibrariesNews.loadData(2, false, true, true, true, function () {

        /////////////////////////////////////////////////
        // Table 1: Authorities
        /////////////////////////////////////////////////
        var tableAuthorities = $('#tblAuthorities').dataTable(
            {
                processing: true,
                responsive: true,
                dom: 'Bfrtip',
                buttons: [
                    { extend: 'print', text: 'Print', className: 'btn-sm' },
                    { extend: 'excelHtml5', text: 'Export Excel', className: 'btn-sm' }
                ],
                deferRender: true,
                data: PublicLibrariesNews.getAuthoritiesDataTable(),
                columns: [
                    { title: "Name" },
                    { title: "Code" },
                    { title: "Libraries" },
                    { title: "Local authority" },
                    { title: "Commissioned" },
                    { title: "Community" },
                    { title: "Independent community" },
                    { title: "Closed" },
                    { title: "Population" },
                    { title: "Area (hectares)" }
                ]
            });

        /////////////////////////////////////////////////
        // Table 2: Libraries
        /////////////////////////////////////////////////
        var tableLibraries = $('#tblLibraries').dataTable(
            {
                processing: true,
                responsive: true,
                dom: 'Bfrtip',
                buttons: [
                    { extend: 'print', text: 'Print', className: 'btn-sm' },
                    { extend: 'excelHtml5', text: 'Export Excel', className: 'btn-sm' }
                ],
                deferRender: true,
                data: PublicLibrariesNews.getLibrariesDataTable(),
                columns: [
                    { title: "Name" },
                    { title: "Address" },
                    { title: "Type" },
                    { title: "Year closed" },
                    { title: "Notes" },
                    { title: "IMD Decile" },
                    { title: "Crime Decile" },
                    { title: "Education Decile" },
                    { title: "Income Decile" },
                    { title: "Health Decile" }
                ]
            });

    });
});