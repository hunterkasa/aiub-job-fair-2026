using AIUB.JobFair.Domain.Common;

namespace AIUB.JobFair.Domain.Entities;

public class AssessmentSet : BaseEntity
{
    public required string Name { get; set; }
    public int Version { get; set; } = 1;
    public string? SourceNote { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<AssessmentQuestion> Questions { get; set; } = new List<AssessmentQuestion>();
    public ICollection<AssessmentBand> Bands { get; set; } = new List<AssessmentBand>();
}

public class AssessmentQuestion : BaseEntity
{
    public Guid SetId { get; set; }
    public AssessmentSet? Set { get; set; }

    public required string Text { get; set; }
    public required string Category { get; set; } // e.g. Extraversion, Agreeableness, Conscientiousness, Emotional Stability, Openness
    public string Type { get; set; } = "Likert"; // MultipleChoice | Likert
    public bool IsReverseKeyed { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;

    public ICollection<AssessmentOption> Options { get; set; } = new List<AssessmentOption>();
}

public class AssessmentOption : BaseEntity
{
    public Guid QuestionId { get; set; }
    public AssessmentQuestion? Question { get; set; }

    public required string Text { get; set; }
    public int Value { get; set; }
}

public class AssessmentBand : BaseEntity
{
    public Guid SetId { get; set; }
    public AssessmentSet? Set { get; set; }

    public required string Category { get; set; }
    public int MinScore { get; set; }
    public int MaxScore { get; set; }
    public required string Label { get; set; } // Low | Medium | High
}

public class AssessmentAttempt : BaseEntity
{
    public Guid StudentId { get; set; }
    public StudentProfile? Student { get; set; }

    public Guid SetId { get; set; }
    public AssessmentSet? Set { get; set; }

    public DateTime StartedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime? ConsentAtUtc { get; set; }

    public ICollection<AssessmentAnswer> Answers { get; set; } = new List<AssessmentAnswer>();
    public ICollection<AssessmentResult> Results { get; set; } = new List<AssessmentResult>();
}

public class AssessmentAnswer : BaseEntity
{
    public Guid AttemptId { get; set; }
    public AssessmentAttempt? Attempt { get; set; }

    public Guid QuestionId { get; set; }
    public AssessmentQuestion? Question { get; set; }

    public int Value { get; set; }
}

public class AssessmentResult : BaseEntity
{
    public Guid AttemptId { get; set; }
    public AssessmentAttempt? Attempt { get; set; }

    public required string Category { get; set; }
    public decimal Score { get; set; }
    public required string Band { get; set; } // Low | Medium | High
}
