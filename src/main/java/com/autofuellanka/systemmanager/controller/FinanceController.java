package com.autofuellanka.systemmanager.controller;

import com.autofuellanka.systemmanager.model.FinanceLedger;
import com.autofuellanka.systemmanager.model.TransactionType;
import com.autofuellanka.systemmanager.repository.FinanceLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @Autowired
    private FinanceLedgerRepository financeLedgerRepository;

    @GetMapping("/ledger")
    public Page<FinanceLedger> getLedger(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String account,
            @RequestParam(required = false) TransactionType type) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return financeLedgerRepository.findAllByOrderByTransactionDateDesc(pageable);
    }

    @GetMapping("/ledger/accounts")
    public List<String> getDistinctAccounts() {
        return financeLedgerRepository.findDistinctAccounts();
    }

    @GetMapping("/ledger/account/{account}/balance")
    public ResponseEntity<Double> getAccountBalance(@PathVariable String account) {
        Double balance = financeLedgerRepository.getAccountBalance(account);
        return ResponseEntity.ok(balance);
    }

    @GetMapping("/ledger/export/csv")
    public ResponseEntity<byte[]> exportLedgerCSV(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String account) {

        try {
            List<FinanceLedger> entries;

            if (from != null && to != null) {
                if (account != null) {
                    entries = financeLedgerRepository.findByAccountAndDateRange(account, from, to);
                } else {
                    entries = financeLedgerRepository.findByDateRange(from, to);
                }
            } else if (account != null) {
                entries = financeLedgerRepository.findByAccountOrderByTransactionDateDesc(account);
            } else {
                entries = financeLedgerRepository.findAll();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintWriter writer = new PrintWriter(baos);

            // CSV Header
            writer.println("Date,Account,Type,Amount,Reference,Description");

            // CSV Data
            for (FinanceLedger entry : entries) {
                writer.printf("%s,%s,%s,%.2f,%s,%s%n",
                        entry.getTransactionDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                        entry.getAccount(),
                        entry.getTransactionType(),
                        entry.getAmount(),
                        entry.getReference() != null ? entry.getReference() : "",
                        entry.getDescription() != null ? entry.getDescription() : ""
                );
            }

            writer.close();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment",
                    "finance_ledger_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(baos.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ledger/summary")
    public ResponseEntity<FinanceSummary> getFinanceSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        FinanceSummary summary = new FinanceSummary();

        LocalDateTime startDate = from != null ? from : LocalDateTime.now().withDayOfMonth(1);
        LocalDateTime endDate = to != null ? to : LocalDateTime.now();

        // Get account balances
        List<String> accounts = financeLedgerRepository.findDistinctAccounts();
        for (String account : accounts) {
            Double balance = financeLedgerRepository.getAccountBalance(account);
            summary.addAccountBalance(account, balance);
        }

        // Get totals for period - Business logic: CREDIT=revenue, DEBIT=inventory expenses only
        Double totalRevenue = financeLedgerRepository.getTotalRevenueForPeriod(startDate, endDate);
        Double totalInventoryExpenses = financeLedgerRepository.getTotalInventoryExpensesForPeriod(startDate, endDate);
        Double cashFlow = financeLedgerRepository.getCashFlowForPeriod(startDate, endDate);
        
        // For this business: DEBIT = inventory expenses only
        Double totalExpenses = totalInventoryExpenses;
        
        Double netIncome = totalRevenue - totalExpenses;

        summary.setTotalDebits(totalExpenses);
        summary.setTotalCredits(totalRevenue);
        summary.setNetAmount(netIncome);
        summary.setCashFlow(cashFlow);

        return ResponseEntity.ok(summary);
    }

    // Finance Summary DTO - Enhanced with proper financial metrics
    public static class FinanceSummary {
        private Double totalDebits = 0.0;        // Total Expenses
        private Double totalCredits = 0.0;        // Total Revenue
        private Double netAmount = 0.0;           // Net Income (Revenue - Expenses)
        private Double cashFlow = 0.0;            // Cash Flow (Money in - Money out)
        private java.util.Map<String, Double> accountBalances = new java.util.HashMap<>();

        public Double getTotalDebits() { return totalDebits; }
        public void setTotalDebits(Double totalDebits) { this.totalDebits = totalDebits; }

        public Double getTotalCredits() { return totalCredits; }
        public void setTotalCredits(Double totalCredits) { this.totalCredits = totalCredits; }

        public Double getNetAmount() { return netAmount; }
        public void setNetAmount(Double netAmount) { this.netAmount = netAmount; }
        
        public Double getCashFlow() { return cashFlow; }
        public void setCashFlow(Double cashFlow) { this.cashFlow = cashFlow; }

        public java.util.Map<String, Double> getAccountBalances() { return accountBalances; }
        public void setAccountBalances(java.util.Map<String, Double> accountBalances) { this.accountBalances = accountBalances; }

        public void addAccountBalance(String account, Double balance) {
            this.accountBalances.put(account, balance);
        }
    }
}