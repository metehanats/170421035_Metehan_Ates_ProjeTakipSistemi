using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Models.EfCore;

public partial class CrmContext : DbContext
{
    public CrmContext()
    {
    }

    public CrmContext(DbContextOptions<CrmContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Attachment> Attachments { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<CustomField> CustomFields { get; set; }

    public virtual DbSet<Issue> Issues { get; set; }

    public virtual DbSet<IssueHistory> IssueHistories { get; set; }

    public virtual DbSet<IssueSprint> IssueSprints { get; set; }

    public virtual DbSet<IssueStatus> IssueStatuses { get; set; }

    public virtual DbSet<IssueType> IssueTypes { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<ProjectMember> ProjectMembers { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Sprint> Sprints { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Workflow> Workflows { get; set; }

    public virtual DbSet<IssueTypeCustomField> IssueTypeCustomFields { get; set; }

    public virtual DbSet<WorkflowIssueType> WorkflowIssueTypes { get; set; }

    public virtual DbSet<SmtpConfiguration> SmtpConfigurations { get; set; }

    public virtual DbSet<WorkflowStatus> WorkflowStatuses { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //=> optionsBuilder.UseSqlServer("Server=sql.bsite.net\\MSSQL2016;Database=emirhancinar_CRM_DB;User Id=emirhancinar_CRM_DB;Password=crm11;MultipleActiveResultSets=true;TrustServerCertificate=True;");
    //  Data Source=crmdb.cp84mw206mc0.eu-north-1.rds.amazonaws.com;Initial Catalog=emirhancinar_CRM_DB;User ID=emirhan;Password=***********;Trust Server Certificate=True
    => optionsBuilder.UseSqlServer("Data Source=crmdb.cp84mw206mc0.eu-north-1.rds.amazonaws.com;Initial Catalog=emirhancinar_CRM_DB;User ID=emirhan;Password=river200;Trust Server Certificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Attachment>(entity =>
        {
            entity.HasKey(e => e.AttachmentId).HasName("PK__Attachme__442C64DE8197A467");

            entity.Property(e => e.AttachmentId).HasColumnName("AttachmentID");
            entity.Property(e => e.FileName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FilePath)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.IssueId).HasColumnName("IssueID");
            entity.Property(e => e.UploadedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Issue).WithMany(p => p.Attachments)
                .HasForeignKey(d => d.IssueId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attachmen__Issue__3F466844");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.Attachments)
                .HasForeignKey(d => d.UploadedBy)
                .HasConstraintName("FK__Attachmen__Uploa__403A8C7D");
        });

        modelBuilder.Entity<SmtpConfiguration>(entity =>
        {

            entity.ToTable("SmtpConfiguration");
            entity.HasKey(e => e.ConfigId).HasName("PK_SmtpConfiguration");

            entity.Property(e => e.ConfigId).HasColumnName("ConfigID");
            entity.Property(e => e.SmtpHost)
                .HasMaxLength(255)
                .IsUnicode(true);
            entity.Property(e => e.Username)
                .HasMaxLength(255)
                .IsUnicode(true);
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .IsUnicode(true);
            entity.Property(e => e.EncryptionType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.FromName)
                .HasMaxLength(255)
                .IsUnicode(true);
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__Comments__C3B4DFAA29207F34");

            entity.Property(e => e.CommentId).HasColumnName("CommentID");
            entity.Property(e => e.Content).HasColumnType("text");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IssueId).HasColumnName("IssueID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Issue).WithMany(p => p.Comments)
                .HasForeignKey(d => d.IssueId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Comments__IssueI__4222D4EF");

            entity.HasOne(d => d.User).WithMany(p => p.Comments)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Comments__UserID__4316F928");
        });

        modelBuilder.Entity<CustomField>(entity =>
        {
            entity.HasKey(e => e.FieldId).HasName("PK__CustomFi__C8B6FF2733DB0CE3");

            entity.Property(e => e.FieldId).HasColumnName("FieldID");
            entity.Property(e => e.FieldName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FieldType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");

            // Yeni eklenen alanların yapılandırması
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Required)
                .HasDefaultValue(false);
            entity.Property(e => e.Searchable)
                .HasDefaultValue(true);
            entity.Property(e => e.Options)
                .HasColumnType("nvarchar(max)");
            entity.Property(e => e.DefaultValue)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Usage)
                .HasDefaultValue(0);

            entity.HasOne(d => d.Project).WithMany(p => p.CustomFields)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CustomFie__Proje__440B1D61");
        });

        modelBuilder.Entity<Issue>(entity =>
        {
            entity.HasKey(e => e.IssueId).HasName("PK__Issues__6C8616249FE0185F");

            entity.Property(e => e.IssueId).HasColumnName("IssueID");
            entity.Property(e => e.AssigneeId).HasColumnName("AssigneeID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.DueDate).HasColumnType("datetime");
            entity.Property(e => e.ParentIssueId).HasColumnName("ParentIssueID");
            entity.Property(e => e.PriorityId).HasColumnName("PriorityID");
            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
            entity.Property(e => e.ReporterId).HasColumnName("ReporterID");
            entity.Property(e => e.StatusId).HasColumnName("StatusID");
            entity.Property(e => e.Title)
                .HasMaxLength(150)
                .IsUnicode(false);
            entity.Property(e => e.TypeId).HasColumnName("TypeID");
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            // Yeni eklenen alan
            entity.Property(e => e.StoryPoints);

            entity.HasOne(d => d.Assignee).WithMany(p => p.IssueAssignees)
                .HasForeignKey(d => d.AssigneeId)
                .HasConstraintName("FK__Issues__Assignee__48CFD27E");

            entity.HasOne(d => d.ParentIssue).WithMany(p => p.InverseParentIssue)
                .HasForeignKey(d => d.ParentIssueId)
                .HasConstraintName("FK__Issues__ParentIs__49C3F6B7");

            entity.HasOne(d => d.Project).WithMany(p => p.Issues)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Issues__ProjectI__4AB81AF0");

            entity.HasOne(d => d.Reporter).WithMany(p => p.IssueReporters)
                .HasForeignKey(d => d.ReporterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Issues__Reporter__4BAC3F29");

            entity.HasOne(d => d.Status).WithMany(p => p.Issues)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Issues__StatusID__4CA06362");

            entity.HasOne(d => d.Type).WithMany(p => p.Issues)
                .HasForeignKey(d => d.TypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Issues__TypeID__4D94879B");
        });

        modelBuilder.Entity<IssueHistory>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__IssueHis__5E5499A836C592F2");

            entity.ToTable("IssueHistory");

            entity.Property(e => e.LogId).HasColumnName("LogID");
            entity.Property(e => e.Action)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IssueId).HasColumnName("IssueID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Issue).WithMany(p => p.IssueHistories)
                .HasForeignKey(d => d.IssueId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__IssueHist__Issue__45F365D3");

            entity.HasOne(d => d.User).WithMany(p => p.IssueHistories)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__IssueHist__UserI__46E78A0C");
        });

        modelBuilder.Entity<IssueSprint>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__IssueSpr__3214EC271E026DF1");

            entity.ToTable("IssueSprint");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.IssueId).HasColumnName("IssueID");
            entity.Property(e => e.SprintId).HasColumnName("SprintID");

            entity.HasOne(d => d.Issue).WithMany(p => p.IssueSprints)
                .HasForeignKey(d => d.IssueId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__IssueSpri__Issue__4E88ABD4");

            entity.HasOne(d => d.Sprint).WithMany(p => p.IssueSprints)
                .HasForeignKey(d => d.SprintId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__IssueSpri__Sprin__4F7CD00D");
        });

        //modelBuilder.Entity<IssueStatus>(entity =>
        //{
        //    entity.HasKey(e => e.StatusId).HasName("PK__IssueSta__C8EE2043091268EE");

        //    entity.ToTable("IssueStatus");

        //    entity.Property(e => e.StatusId).HasColumnName("StatusID");
        //    entity.Property(e => e.Name)
        //        .HasMaxLength(50)
        //        .IsUnicode(false);

        //    // Yeni eklenen alanlar
        //    entity.Property(e => e.Description)
        //        .HasMaxLength(255)
        //        .IsUnicode(false);
        //    entity.Property(e => e.Color)
        //        .HasMaxLength(20)
        //        .IsUnicode(false);
        //    entity.Property(e => e.Category)
        //        .HasMaxLength(20)
        //        .IsUnicode(false)
        //        .HasDefaultValue("todo");
        //});

        modelBuilder.Entity<IssueStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK_IssueSta_C8EE2043091268EE");

            entity.ToTable("IssueStatus");

            entity.Property(e => e.StatusId).HasColumnName("StatusID");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(true);
            entity.Property(e => e.Color)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        //modelBuilder.Entity<IssueType>(entity =>
        //{
        //    entity.HasKey(e => e.TypeId).HasName("PK__IssueTyp__516F0395DE283E54");

        //    entity.Property(e => e.TypeId).HasColumnName("TypeID");
        //    entity.Property(e => e.Color)
        //        .HasMaxLength(20)
        //        .IsUnicode(false);
        //    entity.Property(e => e.Name)
        //        .HasMaxLength(50)
        //        .IsUnicode(false);

        //    // Yeni eklenen alanlar
        //    entity.Property(e => e.Description)
        //        .HasMaxLength(255)
        //        .IsUnicode(false);
        //    entity.Property(e => e.Icon)
        //        .HasMaxLength(50)
        //        .IsUnicode(false);
        //});

        modelBuilder.Entity<IssueType>(entity =>
        {
            entity.HasKey(e => e.TypeId).HasName("PK_IssueTyp_516F0395DE283E54");

            entity.Property(e => e.TypeId).HasColumnName("TypeID");
            entity.Property(e => e.Color)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
            // Yeni alanların yapılandırması
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Icon)
                .HasMaxLength(100)
                .IsUnicode(false);

        });
        // IssueType ve CustomField sınıflarında navigation property ekleyin
        modelBuilder.Entity<IssueType>()
            .HasMany(e => e.IssueTypeCustomFields)
            .WithOne(e => e.IssueType)
            .HasForeignKey(e => e.IssueTypeId);

        modelBuilder.Entity<CustomField>()
            .HasMany(e => e.IssueTypeCustomFields)
            .WithOne(e => e.CustomField)
            .HasForeignKey(e => e.CustomFieldId);

        modelBuilder.Entity<IssueTypeCustomField>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.IsRequired)
                .HasDefaultValue(false);

            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0);

            entity.HasOne(d => d.IssueType)
                .WithMany(p => p.IssueTypeCustomFields)
                .HasForeignKey(d => d.IssueTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_IssueTypeCustomFields_IssueTypes");

            entity.HasOne(d => d.CustomField)
                .WithMany(p => p.IssueTypeCustomFields)
                .HasForeignKey(d => d.CustomFieldId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_IssueTypeCustomFields_CustomFields");

            entity.HasIndex(e => new { e.IssueTypeId, e.CustomFieldId })
                .IsUnique()
                .HasName("UQ_IssueTypeCustomFields");
        });

        

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E32BBBB53CF");

            entity.Property(e => e.NotificationId).HasColumnName("NotificationID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsRead).HasDefaultValue(false);
            entity.Property(e => e.Message).HasColumnType("text");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notificat__UserI__52593CB8");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.ProjectId).HasName("PK__Projects__761ABED0F84E1E1A");

            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Key)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.OwnerId).HasColumnName("OwnerID");

            // Yeni eklenen alanlar
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("planning");
            entity.Property(e => e.Priority)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("medium");
            entity.Property(e => e.CompletedIssues)
                .HasDefaultValue(0);
            entity.Property(e => e.TotalIssues)
                .HasDefaultValue(0);
            entity.Property(e => e.TeamMembers)
                .HasDefaultValue(0);

            entity.HasOne(d => d.Owner).WithMany(p => p.Projects)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Projects__OwnerI__5DCAEF64");
        });

        modelBuilder.Entity<ProjectMember>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ProjectM__3214EC275CAC56F1");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Project).WithMany(p => p.ProjectMembers)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ProjectMe__Proje__534D60F1");

            entity.HasOne(d => d.Role).WithMany(p => p.ProjectMembers)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ProjectMe__RoleI__5441852A");

            entity.HasOne(d => d.User).WithMany(p => p.ProjectMembers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ProjectMe__UserI__5535A963");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3AF0ACB446");

            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Sprint>(entity =>
        {
            entity.HasKey(e => e.SprintId).HasName("PK__Sprints__29F16AE0D2AE87C3");

            entity.Property(e => e.SprintId).HasColumnName("SprintID");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
            entity.Property(e => e.StartDate).HasColumnType("datetime");

            // Yeni eklenen alanlar
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("planned");
            entity.Property(e => e.Goal)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.Project).WithMany(p => p.Sprints)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Sprints__Project__5FB337D6");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC82B8EF95");

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.RoleId).HasColumnName("RoleID");

            // Yeni eklenen alanlar
            entity.Property(e => e.FirstName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.LastName)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__RoleID__628FA481");
        });

        //modelBuilder.Entity<Workflow>(entity =>
        //{
        //    entity.HasKey(e => e.WorkflowId).HasName("PK__Workflow__5704A64A260F2150");

        //    entity.Property(e => e.WorkflowId).HasColumnName("WorkflowID");
        //    entity.Property(e => e.IssueTypeId).HasColumnName("IssueTypeID");

        //    entity.HasOne(d => d.FromStatusNavigation).WithMany(p => p.WorkflowFromStatusNavigations)
        //        .HasForeignKey(d => d.FromStatus)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Workflows__FromS__6383C8BA");

        //    entity.HasOne(d => d.IssueType).WithMany(p => p.Workflows)
        //        .HasForeignKey(d => d.IssueTypeId)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Workflows__Issue__6477ECF3");

        //    entity.HasOne(d => d.ToStatusNavigation).WithMany(p => p.WorkflowToStatusNavigations)
        //        .HasForeignKey(d => d.ToStatus)
        //        .OnDelete(DeleteBehavior.ClientSetNull)
        //        .HasConstraintName("FK__Workflows__ToSta__656C112C");
        //});

        modelBuilder.Entity<Workflow>(entity =>
        {
            entity.HasKey(e => e.WorkflowId).HasName("PK_Workflow_5704A64A260F2150");

            entity.Property(e => e.WorkflowId).HasColumnName("WorkflowID");
            entity.Property(e => e.IssueTypeId).HasColumnName("IssueTypeID");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(true);
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(true);

            entity.HasOne(d => d.FromStatusNavigation).WithMany(p => p.WorkflowFromStatusNavigations)
                .HasForeignKey(d => d.FromStatus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WorkflowsFromS_6383C8BA");

            entity.HasOne(d => d.IssueType).WithMany(p => p.Workflows)
                .HasForeignKey(d => d.IssueTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WorkflowsIssue_6477ECF3");

            entity.HasOne(d => d.ToStatusNavigation).WithMany(p => p.WorkflowToStatusNavigations)
                .HasForeignKey(d => d.ToStatus)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WorkflowsToSta_656C112C");
        });

        modelBuilder.Entity<WorkflowIssueType>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(d => d.Workflow)
                .WithMany(p => p.WorkflowIssueTypes)
                .HasForeignKey(d => d.WorkflowId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_WorkflowIssueTypes_Workflows");

            entity.HasOne(d => d.IssueType)
                .WithMany(p => p.WorkflowIssueTypes)
                .HasForeignKey(d => d.IssueTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WorkflowIssueTypes_IssueTypes");

            entity.HasIndex(e => new { e.WorkflowId, e.IssueTypeId })
                .IsUnique()
                .HasName("UQ_WorkflowIssueTypes");
        });
        

            // OnModelCreating içinde
            modelBuilder.Entity<WorkflowStatus>(entity =>
        {
            entity.HasKey(e => e.Id);
    
            entity.HasOne(d => d.Workflow)
                .WithMany(p => p.WorkflowStatuses)
                .HasForeignKey(d => d.WorkflowId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Status)
                .WithMany()
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });



        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}



//using System;
//using System.Collections.Generic;
//using Microsoft.EntityFrameworkCore;

//namespace CRM.API.Models.EfCore;

//public partial class CrmContext : DbContext
//{
//    public CrmContext()
//    {
//    }

//    public CrmContext(DbContextOptions<CrmContext> options)
//        : base(options)
//    {
//    }

//    public virtual DbSet<Attachment> Attachments { get; set; }

//    public virtual DbSet<Comment> Comments { get; set; }

//    public virtual DbSet<CustomField> CustomFields { get; set; }

//    public virtual DbSet<Issue> Issues { get; set; }

//    public virtual DbSet<IssueHistory> IssueHistories { get; set; }

//    public virtual DbSet<IssueSprint> IssueSprints { get; set; }

//    public virtual DbSet<IssueStatus> IssueStatuses { get; set; }

//    public virtual DbSet<IssueType> IssueTypes { get; set; }

//    public virtual DbSet<Notification> Notifications { get; set; }

//    public virtual DbSet<Project> Projects { get; set; }

//    public virtual DbSet<ProjectMember> ProjectMembers { get; set; }

//    public virtual DbSet<Role> Roles { get; set; }

//    public virtual DbSet<Sprint> Sprints { get; set; }

//    public virtual DbSet<User> Users { get; set; }

//    public virtual DbSet<Workflow> Workflows { get; set; }


//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//    //=> optionsBuilder.UseSqlServer("Server=sql.bsite.net\\MSSQL2016;Database=emirhancinar_CRM_DB;User Id=emirhancinar_CRM_DB;Password=crm11;MultipleActiveResultSets=true;TrustServerCertificate=True;");
//    //  Data Source=crmdb.cp84mw206mc0.eu-north-1.rds.amazonaws.com;Initial Catalog=emirhancinar_CRM_DB;User ID=emirhan;Password=***********;Trust Server Certificate=True
//    => optionsBuilder.UseSqlServer("Data Source=crmdb.cp84mw206mc0.eu-north-1.rds.amazonaws.com;Initial Catalog=emirhancinar_CRM_DB;User ID=emirhan;Password=river200;Trust Server Certificate=True;");



//    protected override void OnModelCreating(ModelBuilder modelBuilder)
//    {
//        modelBuilder.Entity<Attachment>(entity =>
//        {
//            entity.HasKey(e => e.AttachmentId).HasName("PK__Attachme__442C64DE8197A467");

//            entity.Property(e => e.AttachmentId).HasColumnName("AttachmentID");
//            entity.Property(e => e.FileName)
//                .HasMaxLength(100)
//                .IsUnicode(false);
//            entity.Property(e => e.FilePath)
//                .HasMaxLength(255)
//                .IsUnicode(false);
//            entity.Property(e => e.IssueId).HasColumnName("IssueID");
//            entity.Property(e => e.UploadedAt)
//                .HasDefaultValueSql("(getdate())")
//                .HasColumnType("datetime");

//            entity.HasOne(d => d.Issue).WithMany(p => p.Attachments)
//                .HasForeignKey(d => d.IssueId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Attachmen__Issue__3F466844");

//            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.Attachments)
//                .HasForeignKey(d => d.UploadedBy)
//                .HasConstraintName("FK__Attachmen__Uploa__403A8C7D");
//        });

//        modelBuilder.Entity<Comment>(entity =>
//        {
//            entity.HasKey(e => e.CommentId).HasName("PK__Comments__C3B4DFAA29207F34");

//            entity.Property(e => e.CommentId).HasColumnName("CommentID");
//            entity.Property(e => e.Content).HasColumnType("text");
//            entity.Property(e => e.CreatedAt)
//                .HasDefaultValueSql("(getdate())")
//                .HasColumnType("datetime");
//            entity.Property(e => e.IssueId).HasColumnName("IssueID");
//            entity.Property(e => e.UserId).HasColumnName("UserID");

//            entity.HasOne(d => d.Issue).WithMany(p => p.Comments)
//                .HasForeignKey(d => d.IssueId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Comments__IssueI__4222D4EF");

//            entity.HasOne(d => d.User).WithMany(p => p.Comments)
//                .HasForeignKey(d => d.UserId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Comments__UserID__4316F928");
//        });

//        modelBuilder.Entity<CustomField>(entity =>
//        {
//            entity.HasKey(e => e.FieldId).HasName("PK__CustomFi__C8B6FF2733DB0CE3");

//            entity.Property(e => e.FieldId).HasColumnName("FieldID");
//            entity.Property(e => e.FieldName)
//                .HasMaxLength(100)
//                .IsUnicode(false);
//            entity.Property(e => e.FieldType)
//                .HasMaxLength(50)
//                .IsUnicode(false);
//            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");

//            entity.HasOne(d => d.Project).WithMany(p => p.CustomFields)
//                .HasForeignKey(d => d.ProjectId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__CustomFie__Proje__440B1D61");
//        });

//        modelBuilder.Entity<Issue>(entity =>
//        {
//            entity.HasKey(e => e.IssueId).HasName("PK__Issues__6C8616249FE0185F");

//            entity.Property(e => e.IssueId).HasColumnName("IssueID");
//            entity.Property(e => e.AssigneeId).HasColumnName("AssigneeID");
//            entity.Property(e => e.CreatedAt)
//                .HasDefaultValueSql("(getdate())")
//                .HasColumnType("datetime");
//            entity.Property(e => e.Description).HasColumnType("text");
//            entity.Property(e => e.DueDate).HasColumnType("datetime");
//            entity.Property(e => e.ParentIssueId).HasColumnName("ParentIssueID");
//            entity.Property(e => e.PriorityId).HasColumnName("PriorityID");
//            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
//            entity.Property(e => e.ReporterId).HasColumnName("ReporterID");
//            entity.Property(e => e.StatusId).HasColumnName("StatusID");
//            entity.Property(e => e.Title)
//                .HasMaxLength(150)
//                .IsUnicode(false);
//            entity.Property(e => e.TypeId).HasColumnName("TypeID");
//            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

//            entity.HasOne(d => d.Assignee).WithMany(p => p.IssueAssignees)
//                .HasForeignKey(d => d.AssigneeId)
//                .HasConstraintName("FK__Issues__Assignee__48CFD27E");

//            entity.HasOne(d => d.ParentIssue).WithMany(p => p.InverseParentIssue)
//                .HasForeignKey(d => d.ParentIssueId)
//                .HasConstraintName("FK__Issues__ParentIs__49C3F6B7");

//            entity.HasOne(d => d.Project).WithMany(p => p.Issues)
//                .HasForeignKey(d => d.ProjectId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Issues__ProjectI__4AB81AF0");

//            entity.HasOne(d => d.Reporter).WithMany(p => p.IssueReporters)
//                .HasForeignKey(d => d.ReporterId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Issues__Reporter__4BAC3F29");

//            entity.HasOne(d => d.Status).WithMany(p => p.Issues)
//                .HasForeignKey(d => d.StatusId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Issues__StatusID__4CA06362");

//            entity.HasOne(d => d.Type).WithMany(p => p.Issues)
//                .HasForeignKey(d => d.TypeId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Issues__TypeID__4D94879B");
//        });

//        modelBuilder.Entity<IssueHistory>(entity =>
//        {
//            entity.HasKey(e => e.LogId).HasName("PK__IssueHis__5E5499A836C592F2");

//            entity.ToTable("IssueHistory");

//            entity.Property(e => e.LogId).HasColumnName("LogID");
//            entity.Property(e => e.Action)
//                .HasMaxLength(255)
//                .IsUnicode(false);
//            entity.Property(e => e.CreatedAt)
//                .HasDefaultValueSql("(getdate())")
//                .HasColumnType("datetime");
//            entity.Property(e => e.IssueId).HasColumnName("IssueID");
//            entity.Property(e => e.UserId).HasColumnName("UserID");

//            entity.HasOne(d => d.Issue).WithMany(p => p.IssueHistories)
//                .HasForeignKey(d => d.IssueId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__IssueHist__Issue__45F365D3");

//            entity.HasOne(d => d.User).WithMany(p => p.IssueHistories)
//                .HasForeignKey(d => d.UserId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__IssueHist__UserI__46E78A0C");
//        });

//        modelBuilder.Entity<IssueSprint>(entity =>
//        {
//            entity.HasKey(e => e.Id).HasName("PK__IssueSpr__3214EC271E026DF1");

//            entity.ToTable("IssueSprint");

//            entity.Property(e => e.Id).HasColumnName("ID");
//            entity.Property(e => e.IssueId).HasColumnName("IssueID");
//            entity.Property(e => e.SprintId).HasColumnName("SprintID");

//            entity.HasOne(d => d.Issue).WithMany(p => p.IssueSprints)
//                .HasForeignKey(d => d.IssueId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__IssueSpri__Issue__4E88ABD4");

//            entity.HasOne(d => d.Sprint).WithMany(p => p.IssueSprints)
//                .HasForeignKey(d => d.SprintId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__IssueSpri__Sprin__4F7CD00D");
//        });

//        modelBuilder.Entity<IssueStatus>(entity =>
//        {
//            entity.HasKey(e => e.StatusId).HasName("PK__IssueSta__C8EE2043091268EE");

//            entity.ToTable("IssueStatus");

//            entity.Property(e => e.StatusId).HasColumnName("StatusID");
//            entity.Property(e => e.Name)
//                .HasMaxLength(50)
//                .IsUnicode(false);
//        });

//        modelBuilder.Entity<IssueType>(entity =>
//        {
//            entity.HasKey(e => e.TypeId).HasName("PK__IssueTyp__516F0395DE283E54");

//            entity.Property(e => e.TypeId).HasColumnName("TypeID");
//            entity.Property(e => e.Color)
//                .HasMaxLength(20)
//                .IsUnicode(false);
//            entity.Property(e => e.Name)
//                .HasMaxLength(50)
//                .IsUnicode(false);
//        });

//        modelBuilder.Entity<Notification>(entity =>
//        {
//            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E32BBBB53CF");

//            entity.Property(e => e.NotificationId).HasColumnName("NotificationID");
//            entity.Property(e => e.CreatedAt)
//                .HasDefaultValueSql("(getdate())")
//                .HasColumnType("datetime");
//            entity.Property(e => e.IsRead).HasDefaultValue(false);
//            entity.Property(e => e.Message).HasColumnType("text");
//            entity.Property(e => e.UserId).HasColumnName("UserID");

//            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
//                .HasForeignKey(d => d.UserId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Notificat__UserI__52593CB8");
//        });

//        modelBuilder.Entity<Project>(entity =>
//        {
//            entity.HasKey(e => e.ProjectId).HasName("PK__Projects__761ABED0F84E1E1A");

//            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
//            entity.Property(e => e.CreatedAt)
//                .HasDefaultValueSql("(getdate())")
//                .HasColumnType("datetime");
//            entity.Property(e => e.Description).HasColumnType("text");
//            entity.Property(e => e.IsActive).HasDefaultValue(true);
//            entity.Property(e => e.Key)
//                .HasMaxLength(10)
//                .IsUnicode(false);
//            entity.Property(e => e.Name)
//                .HasMaxLength(100)
//                .IsUnicode(false);
//            entity.Property(e => e.OwnerId).HasColumnName("OwnerID");

//            entity.HasOne(d => d.Owner).WithMany(p => p.Projects)
//                .HasForeignKey(d => d.OwnerId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Projects__OwnerI__5DCAEF64");
//        });

//        modelBuilder.Entity<ProjectMember>(entity =>
//        {
//            entity.HasKey(e => e.Id).HasName("PK__ProjectM__3214EC275CAC56F1");

//            entity.Property(e => e.Id).HasColumnName("ID");
//            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
//            entity.Property(e => e.RoleId).HasColumnName("RoleID");
//            entity.Property(e => e.UserId).HasColumnName("UserID");

//            entity.HasOne(d => d.Project).WithMany(p => p.ProjectMembers)
//                .HasForeignKey(d => d.ProjectId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__ProjectMe__Proje__534D60F1");

//            entity.HasOne(d => d.Role).WithMany(p => p.ProjectMembers)
//                .HasForeignKey(d => d.RoleId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__ProjectMe__RoleI__5441852A");

//            entity.HasOne(d => d.User).WithMany(p => p.ProjectMembers)
//                .HasForeignKey(d => d.UserId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__ProjectMe__UserI__5535A963");
//        });

//        modelBuilder.Entity<Role>(entity =>
//        {
//            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3AF0ACB446");

//            entity.Property(e => e.RoleId).HasColumnName("RoleID");
//            entity.Property(e => e.Name)
//                .HasMaxLength(50)
//                .IsUnicode(false);
//        });

//        modelBuilder.Entity<Sprint>(entity =>
//        {
//            entity.HasKey(e => e.SprintId).HasName("PK__Sprints__29F16AE0D2AE87C3");

//            entity.Property(e => e.SprintId).HasColumnName("SprintID");
//            entity.Property(e => e.EndDate).HasColumnType("datetime");
//            entity.Property(e => e.IsActive).HasDefaultValue(true);
//            entity.Property(e => e.Name)
//                .HasMaxLength(100)
//                .IsUnicode(false);
//            entity.Property(e => e.ProjectId).HasColumnName("ProjectID");
//            entity.Property(e => e.StartDate).HasColumnType("datetime");

//            entity.HasOne(d => d.Project).WithMany(p => p.Sprints)
//                .HasForeignKey(d => d.ProjectId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Sprints__Project__5FB337D6");
//        });

//        modelBuilder.Entity<User>(entity =>
//        {
//            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC82B8EF95");

//            entity.Property(e => e.UserId).HasColumnName("UserID");
//            entity.Property(e => e.CreatedAt)
//                .HasDefaultValueSql("(getdate())")
//                .HasColumnType("datetime");
//            entity.Property(e => e.Email)
//                .HasMaxLength(100)
//                .IsUnicode(false);
//            entity.Property(e => e.FullName)
//                .HasMaxLength(100)
//                .IsUnicode(false);
//            entity.Property(e => e.IsActive).HasDefaultValue(true);
//            entity.Property(e => e.PasswordHash)
//                .HasMaxLength(255)
//                .IsUnicode(false);
//            entity.Property(e => e.RoleId).HasColumnName("RoleID");

//            entity.HasOne(d => d.Role).WithMany(p => p.Users)
//                .HasForeignKey(d => d.RoleId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Users__RoleID__628FA481");
//        });

//        modelBuilder.Entity<Workflow>(entity =>
//        {
//            entity.HasKey(e => e.WorkflowId).HasName("PK__Workflow__5704A64A260F2150");

//            entity.Property(e => e.WorkflowId).HasColumnName("WorkflowID");
//            entity.Property(e => e.IssueTypeId).HasColumnName("IssueTypeID");

//            entity.HasOne(d => d.FromStatusNavigation).WithMany(p => p.WorkflowFromStatusNavigations)
//                .HasForeignKey(d => d.FromStatus)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Workflows__FromS__6383C8BA");

//            entity.HasOne(d => d.IssueType).WithMany(p => p.Workflows)
//                .HasForeignKey(d => d.IssueTypeId)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Workflows__Issue__6477ECF3");

//            entity.HasOne(d => d.ToStatusNavigation).WithMany(p => p.WorkflowToStatusNavigations)
//                .HasForeignKey(d => d.ToStatus)
//                .OnDelete(DeleteBehavior.ClientSetNull)
//                .HasConstraintName("FK__Workflows__ToSta__656C112C");
//        });

//        OnModelCreatingPartial(modelBuilder);
//    }

//    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
//}
