#Ingestion Approach Sequence
1. Create DocumentModel
2. Flush to obtain document ID
3. Build storage directory
4. Save the physical file
5. Assign path to DocumentModel
6. Set ingestion_status = "pending"
7. Commit
8. Trigger ingestion

