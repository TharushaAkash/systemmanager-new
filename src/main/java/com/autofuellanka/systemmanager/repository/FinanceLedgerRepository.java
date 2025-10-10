package com.autofuellanka.systemmanager.repository;

import com.autofuellanka.systemmanager.model.FinanceLedger;
import com.autofuellanka.systemmanager.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FinanceLedgerRepository extends JpaRepository<FinanceLedger, Long> {
    
    // Find by date range
    @Query("SELECT fl FROM FinanceLedger fl WHERE fl.transactionDate BETWEEN :startDate AND :endDate ORDER BY fl.transactionDate DESC")
    List<FinanceLedger> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find by account
    List<FinanceLedger> findByAccountOrderByTransactionDateDesc(String account);
    
    // Find by transaction type
    List<FinanceLedger> findByTransactionTypeOrderByTransactionDateDesc(TransactionType transactionType);
    
    // Find by account and date range
    @Query("SELECT fl FROM FinanceLedger fl WHERE fl.account = :account AND fl.transactionDate BETWEEN :startDate AND :endDate ORDER BY fl.transactionDate DESC")
    List<FinanceLedger> findByAccountAndDateRange(@Param("account") String account, 
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    // Get ledger with pagination
    Page<FinanceLedger> findAllByOrderByTransactionDateDesc(Pageable pageable);
    
    // Get distinct accounts
    @Query("SELECT DISTINCT fl.account FROM FinanceLedger fl ORDER BY fl.account")
    List<String> findDistinctAccounts();
    
    // Get account balance
    @Query("SELECT COALESCE(SUM(CASE WHEN fl.transactionType = 'CREDIT' THEN fl.amount ELSE -fl.amount END), 0) FROM FinanceLedger fl WHERE fl.account = :account")
    Double getAccountBalance(@Param("account") String account);
    
    // Get total debits by account and date range
    @Query("SELECT COALESCE(SUM(fl.amount), 0) FROM FinanceLedger fl WHERE fl.account = :account AND fl.transactionType = 'DEBIT' AND fl.transactionDate BETWEEN :startDate AND :endDate")
    Double getTotalDebitsByAccountAndDateRange(@Param("account") String account, 
                                              @Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);
    
    // Get total credits by account and date range
    @Query("SELECT COALESCE(SUM(fl.amount), 0) FROM FinanceLedger fl WHERE fl.account = :account AND fl.transactionType = 'CREDIT' AND fl.transactionDate BETWEEN :startDate AND :endDate")
    Double getTotalCreditsByAccountAndDateRange(@Param("account") String account, 
                                               @Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);
}