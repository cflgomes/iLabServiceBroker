<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">

<% if (header !== false) { %>
<soap:Header>
    <% var ns_no = 2; %>
    <% _(header).each(function(single_header) { %>
        <<%= single_header.name%><% if(single_header.namespace) {%> xmlns=<%="\"http://ilab.mit.edu\""%><%}%>><%= single_header.value%></<%= single_header.name%>>
        <% ns_no++; %>
    <% }); %>
</soap:Header>
<% } %>

<soap:Body>
    <% if (namespace !== false) {%><<%=method%> xmlns=<%="\"http://ilab.mit.edu\""%>><% } else {%> <<%=method%>> <% } %><% if (params !== false) {%><%= params%><% } %><% if (namespace !== false) {%></<%=method%>><% } else { %> </<%=method%>> <% } %>
</soap:Body>
</soap:Envelope>